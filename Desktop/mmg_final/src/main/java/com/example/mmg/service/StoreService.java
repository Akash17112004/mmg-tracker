package com.example.mmg.service;

import com.example.mmg.dto.StoreDtos.*;
import com.example.mmg.entity.*;
import com.example.mmg.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StoreService {
 private final StoreCategoryRepository categoryRepo;
 private final StoreItemRepository itemRepo;
 private final StoreLedgerEntryRepository ledgerRepo;
 private final StoreDemandRepository demandRepo;
 private final StoreCorrectionRequestRepository correctionRepo;
 private final StoreUnitRepository unitRepo;
 private final UserRepository userRepo;

 private User current(){String u=SecurityContextHolder.getContext().getAuthentication().getName(); return userRepo.findByUsername(u).orElseThrow();}
 private String role(){return current().getRole().getName().toUpperCase();}
 private boolean is(String r){return role().equals(r);}
 private boolean superAdmin(){return is("JS_ADMIN") || is("DIRECTOR_ADMIN");}
 private boolean storeUser(){return is("OIC_STORE")||is("BILLING");}
 private void demandWriter(){if(!is("ADMIN")&&!superAdmin()) throw new SecurityException("Only Admin or executive admins can create demands");}
 private void mutateStore(){if(!storeUser()&&!superAdmin()) throw new SecurityException("Store editing is restricted to Store staff and executive admins");}
 private void oic(){if(!is("OIC_STORE")&&!superAdmin()) throw new SecurityException("Only OIC Store or executive admins can perform this action");}

 @Transactional(readOnly = true)
 public List<CategoryDto> categories(){return categoryRepo.findByActiveTrueOrderByNameAsc().stream().map(CategoryDto::from).toList();}
 public CategoryDto createCategory(CreateCategoryRequest r){
  mutateStore();
  if (r.subfields() == null || r.subfields().stream().filter(v -> v != null && !v.isBlank()).count() < 3) {
   throw new IllegalArgumentException("Add at least three category subfields");
  }
  StoreCategory c=new StoreCategory(); c.setName(r.name().trim());
  int order=0;
  for(String field : r.subfields()) { if(field != null && !field.isBlank()) c.addField(field.trim(), order++); }
  return CategoryDto.from(categoryRepo.save(c));
}
 public List<StoreItemDto> items(String q){List<StoreItem> list=(q==null||q.isBlank())?itemRepo.findByActiveTrueOrderByCategory_NameAscNameAsc():itemRepo.findByNameContainingIgnoreCaseOrCategory_NameContainingIgnoreCase(q,q); return list.stream().filter(StoreItem::isActive).map(StoreItemDto::from).toList();}
 public StoreItemDto createItem(CreateStoreItemRequest r){mutateStore(); StoreCategory c=categoryRepo.findById(r.categoryId()).orElseThrow(()->new IllegalArgumentException("Store category not found")); StoreItem i=new StoreItem(); i.setName(r.name().trim()); i.setCategory(c); i.setUnit(r.unit().trim()); return StoreItemDto.from(itemRepo.save(i));}
 public List<UnitDto> units(){return unitRepo.findByActiveTrueOrderByNameAsc().stream().map(UnitDto::from).toList();}
 public UnitDto createUnit(CreateUnitRequest r){mutateStore(); StoreUnit u=new StoreUnit();u.setName(r.name().trim());return UnitDto.from(unitRepo.save(u));}

 public List<LedgerDto> ledger(String q){List<StoreLedgerEntry> all=ledgerRepo.findAllByOrderByEntryDateDescIdDesc(); if(q==null||q.isBlank()) return all.stream().map(LedgerDto::from).toList(); String x=q.toLowerCase(); return all.stream().filter(e->contains(e.getStoreItem().getName(),x)||contains(e.getStoreItem().getCategory().getName(),x)||contains(e.getVendorName(),x)||contains(e.getUserUnitName(),x)||contains(e.getVoucherNo(),x)||contains(e.getRemarks(),x)).map(LedgerDto::from).toList();}
 private boolean contains(String s,String q){return s!=null&&s.toLowerCase().contains(q);}

 @Transactional
 public LedgerDto addLedger(CreateLedgerRequest r){mutateStore(); validateTxn(r.receipt(),r.issue(),r.unitPrice()); StoreItem item=itemRepo.findById(r.itemId()).orElseThrow(()->new IllegalArgumentException("Store item not found")); StoreLedgerEntry e=new StoreLedgerEntry();e.setEntryDate(r.date());e.setStoreItem(item);e.setVendorName(clean(r.vendorName()));e.setUserUnitName(clean(r.userUnitName()));e.setVoucherNo(clean(r.voucherNo()));e.setUnitPrice(r.unitPrice().setScale(2,RoundingMode.HALF_UP));e.setReceipt(r.receipt());e.setIssue(r.issue());e.setRemarks(clean(r.remarks()));e.setCreatedBy(current()); ledgerRepo.save(e); recalc(item.getId()); return LedgerDto.from(ledgerRepo.findById(e.getId()).orElseThrow());}

 @Transactional
 public void deleteLedger(Long id){if(!superAdmin()) throw new SecurityException("Only JS Admin can directly delete Store ledger records"); StoreLedgerEntry e=ledgerRepo.findById(id).orElseThrow(); Long item=e.getStoreItem().getId(); ledgerRepo.delete(e); ledgerRepo.flush(); recalc(item);}

 @Transactional
 public CorrectionDto raiseCorrection(Long ledgerId,CreateCorrectionRequest r){if(!is("BILLING")&&!superAdmin()) throw new SecurityException("Billing raises Store corrections"); StoreLedgerEntry e=ledgerRepo.findById(ledgerId).orElseThrow(); StoreCorrectionRequest c=new StoreCorrectionRequest();c.setLedgerEntry(e);c.setRaisedBy(current());c.setReason(r.reason());c.setCorrectedReceipt(r.correctedReceipt());c.setCorrectedIssue(r.correctedIssue());c.setCorrectedUnitPrice(r.correctedUnitPrice());c.setCorrectedVendorName(clean(r.correctedVendorName()));c.setCorrectedUserUnitName(clean(r.correctedUserUnitName()));c.setCorrectedVoucherNo(clean(r.correctedVoucherNo()));validateOptionalCorrection(c);return CorrectionDto.from(correctionRepo.save(c));}
 public List<CorrectionDto> corrections(){return correctionRepo.findAllByOrderByCreatedAtDesc().stream().map(CorrectionDto::from).toList();}
 @Transactional
 public CorrectionDto reviewCorrection(Long id,ReviewCorrectionRequest r){oic(); StoreCorrectionRequest c=correctionRepo.findById(id).orElseThrow(); if(c.getStatus()!=StoreCorrectionStatus.PENDING) throw new IllegalStateException("Correction is already reviewed"); c.setReviewedBy(current());c.setReviewedAt(LocalDateTime.now());c.setOicRemarks(clean(r.remarks())); if(Boolean.TRUE.equals(r.approve())){c.setStatus(StoreCorrectionStatus.APPROVED);}else{c.setStatus(StoreCorrectionStatus.REJECTED);} return CorrectionDto.from(correctionRepo.save(c));}
 @Transactional
 public CorrectionDto applyCorrection(Long id){if(!is("BILLING")&&!superAdmin()) throw new SecurityException("Only Billing can apply an approved correction"); StoreCorrectionRequest c=correctionRepo.findById(id).orElseThrow(); if(c.getStatus()!=StoreCorrectionStatus.APPROVED) throw new IllegalStateException("Correction must be approved by OIC first"); StoreLedgerEntry e=c.getLedgerEntry(); if(c.getCorrectedReceipt()!=null)e.setReceipt(c.getCorrectedReceipt());if(c.getCorrectedIssue()!=null)e.setIssue(c.getCorrectedIssue());if(c.getCorrectedUnitPrice()!=null)e.setUnitPrice(c.getCorrectedUnitPrice());if(c.getCorrectedVendorName()!=null)e.setVendorName(c.getCorrectedVendorName());if(c.getCorrectedUserUnitName()!=null)e.setUserUnitName(c.getCorrectedUserUnitName());if(c.getCorrectedVoucherNo()!=null)e.setVoucherNo(c.getCorrectedVoucherNo()); validateTxn(e.getReceipt(),e.getIssue(),e.getUnitPrice()); ledgerRepo.save(e); recalc(e.getStoreItem().getId()); c.setStatus(StoreCorrectionStatus.APPLIED);c.setAppliedAt(LocalDateTime.now());return CorrectionDto.from(correctionRepo.save(c));}

 public List<DemandDto> demands(){return demandRepo.findAllByOrderByRequestedAtDesc().stream().map(DemandDto::from).toList();}
 @Transactional public DemandDto createDemand(CreateDemandRequest r){demandWriter(); if((r.itemId()==null)==(r.customItemName()==null||r.customItemName().isBlank())) throw new IllegalArgumentException("Choose an existing item or enter a new demand item"); StoreDemand d=new StoreDemand(); if(r.itemId()!=null)d.setStoreItem(itemRepo.findById(r.itemId()).orElseThrow(()->new IllegalArgumentException("Store item not found"))); else d.setCustomItemName(r.customItemName().trim()); d.setQuantity(r.quantity());d.setUserUnitName(r.userUnitName().trim());d.setPurpose(clean(r.purpose()));d.setRequestedBy(current());return DemandDto.from(demandRepo.save(d));}
 @Transactional public DemandDto approveDemand(Long id,DemandActionRequest r){mutateStore(); StoreDemand d=demandRepo.findById(id).orElseThrow(); if(d.getStatus()!=StoreDemandStatus.PENDING)throw new IllegalStateException("Demand is not pending"); if(r.itemId()!=null)d.setStoreItem(itemRepo.findById(r.itemId()).orElseThrow(()->new IllegalArgumentException("Store item not found"))); if(d.getStoreItem()==null)throw new IllegalArgumentException("A new demand must be linked to a Store catalogue item before approval"); d.setStatus(StoreDemandStatus.APPROVED);d.setStoreRemarks(clean(r.remarks()));return DemandDto.from(demandRepo.save(d));}
 @Transactional public DemandDto rejectDemand(Long id,String remarks){mutateStore();StoreDemand d=demandRepo.findById(id).orElseThrow();d.setStatus(StoreDemandStatus.REJECTED);d.setStoreRemarks(clean(remarks));return DemandDto.from(demandRepo.save(d));}
 @Transactional public DemandDto fulfillDemand(Long id,DemandActionRequest r){mutateStore();StoreDemand d=demandRepo.findById(id).orElseThrow();if(d.getStoreItem()==null&&r.itemId()!=null)d.setStoreItem(itemRepo.findById(r.itemId()).orElseThrow());if(d.getStoreItem()==null)throw new IllegalArgumentException("Select the catalogue item to issue");int remaining=d.getQuantity()-d.getFulfilledQty();int qty=r.quantity()==null?remaining:r.quantity();if(qty<1||qty>remaining)throw new IllegalArgumentException("Invalid fulfilment quantity"); BigDecimal currentAvg=averageValue(d.getStoreItem().getId()); int balance=balanceQty(d.getStoreItem().getId()); if(balance<qty)throw new IllegalArgumentException("Insufficient stock. Available: "+balance); StoreLedgerEntry e=new StoreLedgerEntry();e.setEntryDate(java.time.LocalDate.now());e.setStoreItem(d.getStoreItem());e.setUserUnitName(d.getUserUnitName());e.setVoucherNo("DEMAND-"+d.getId());e.setUnitPrice(currentAvg);e.setIssue(qty);e.setReceipt(0);e.setRemarks("Demand #"+d.getId()+ (r.remarks()==null?"":" - "+r.remarks()));e.setCreatedBy(current());ledgerRepo.save(e);recalc(e.getStoreItem().getId());d.setFulfilledQty(d.getFulfilledQty()+qty);d.setStatus(d.getFulfilledQty().equals(d.getQuantity())?StoreDemandStatus.FULFILLED:StoreDemandStatus.PARTIALLY_FULFILLED);return DemandDto.from(demandRepo.save(d));}

 public StoreSummary summary(){ long cats=categoryRepo.count(); long items=itemRepo.count(); long rows=ledgerRepo.count(); long pd=demandRepo.findByStatusOrderByRequestedAtDesc(StoreDemandStatus.PENDING).size(); long pc=correctionRepo.findByStatusOrderByCreatedAtDesc(StoreCorrectionStatus.PENDING).size(); int qty=0; BigDecimal value=BigDecimal.ZERO; for(StoreItem item:itemRepo.findAll()){List<StoreLedgerEntry> r=ledgerRepo.findByStoreItem_IdOrderByEntryDateAscIdAsc(item.getId()); if(!r.isEmpty()){StoreLedgerEntry last=r.get(r.size()-1); qty+=last.getBalanceQty(); value=value.add(last.getBalanceValue());}} return new StoreSummary(cats,items,rows,pd,pc,qty,value.doubleValue());}

 private void validateTxn(int receipt,int issue,BigDecimal price){if(receipt<0||issue<0)throw new IllegalArgumentException("Receipt and Issue cannot be negative");if(receipt>0&&issue>0)throw new IllegalArgumentException("A ledger row cannot contain both Receipt and Issue");if(price==null||price.signum()<0)throw new IllegalArgumentException("Unit price cannot be negative");}
 private void validateOptionalCorrection(StoreCorrectionRequest c){if(c.getCorrectedReceipt()!=null&&c.getCorrectedIssue()!=null&&c.getCorrectedReceipt()>0&&c.getCorrectedIssue()>0)throw new IllegalArgumentException("Receipt and Issue cannot both be positive");if(c.getCorrectedReceipt()!=null&&c.getCorrectedReceipt()<0||c.getCorrectedIssue()!=null&&c.getCorrectedIssue()<0)throw new IllegalArgumentException("Receipt and Issue cannot be negative");}
 private String clean(String s){return s==null||s.isBlank()?null:s.trim();}
 private int balanceQty(Long itemId){List<StoreLedgerEntry> rows=ledgerRepo.findByStoreItem_IdOrderByEntryDateAscIdAsc(itemId);int q=0;for(StoreLedgerEntry e:rows)q+=e.getReceipt()-e.getIssue();return q;}
 private BigDecimal averageValue(Long itemId){List<StoreLedgerEntry> rows=ledgerRepo.findByStoreItem_IdOrderByEntryDateAscIdAsc(itemId);int q=0;BigDecimal v=BigDecimal.ZERO;for(StoreLedgerEntry e:rows){if(e.getReceipt()>0){v=v.add(e.getUnitPrice().multiply(BigDecimal.valueOf(e.getReceipt())));q+=e.getReceipt();}if(e.getIssue()>0&&q>0){BigDecimal avg=v.divide(BigDecimal.valueOf(q),8,RoundingMode.HALF_UP);v=v.subtract(avg.multiply(BigDecimal.valueOf(e.getIssue())));q-=e.getIssue();}}return q>0?v.divide(BigDecimal.valueOf(q),2,RoundingMode.HALF_UP):BigDecimal.ZERO;}
 @Transactional private void recalc(Long itemId){List<StoreLedgerEntry> rows=ledgerRepo.findByStoreItem_IdOrderByEntryDateAscIdAsc(itemId);int qty=0;BigDecimal value=BigDecimal.ZERO;for(StoreLedgerEntry e:rows){if(e.getReceipt()>0){value=value.add(e.getUnitPrice().multiply(BigDecimal.valueOf(e.getReceipt())));qty+=e.getReceipt();}if(e.getIssue()>0){if(qty<e.getIssue())throw new IllegalArgumentException("Ledger would make stock negative for "+e.getStoreItem().getName());BigDecimal avg=qty==0?BigDecimal.ZERO:value.divide(BigDecimal.valueOf(qty),8,RoundingMode.HALF_UP);value=value.subtract(avg.multiply(BigDecimal.valueOf(e.getIssue())));qty-=e.getIssue();}e.setBalanceQty(qty);e.setBalanceValue(value.max(BigDecimal.ZERO).setScale(2,RoundingMode.HALF_UP));ledgerRepo.save(e);}}
}
