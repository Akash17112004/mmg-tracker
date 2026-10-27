package com.example.mmg.dto;

import com.example.mmg.entity.*;
import jakarta.validation.constraints.*;
import java.util.List;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class StoreDtos {
 public record CategoryDto(Long id, String name, List<String> subfields) { public static CategoryDto from(StoreCategory c){return new CategoryDto(c.getId(),c.getName(),c.getFields().stream().map(StoreCategoryField::getName).toList());} }
 public record StoreItemDto(Long id,String name,Long categoryId,String categoryName,String unit,boolean active){
  public static StoreItemDto from(StoreItem i){return new StoreItemDto(i.getId(),i.getName(),i.getCategory().getId(),i.getCategory().getName(),i.getUnit(),i.isActive());}
 }
 public record CreateCategoryRequest(@NotBlank String name, @NotNull @Size(min = 3, message = "Add at least three category subfields") List<@NotBlank @Size(max = 100) String> subfields) {}
 public record CreateStoreItemRequest(@NotBlank String name,@NotNull Long categoryId,@NotBlank String unit) {}
 public record LedgerDto(Long id,LocalDate date,Long itemId,String itemName,String categoryName,String vendorName,String userUnitName,String voucherNo,BigDecimal unitPrice,Integer receipt,Integer issue,Integer balanceQty,BigDecimal balanceValue,String remarks,String createdBy,LocalDateTime createdAt){
  public static LedgerDto from(StoreLedgerEntry e){return new LedgerDto(e.getId(),e.getEntryDate(),e.getStoreItem().getId(),e.getStoreItem().getName(),e.getStoreItem().getCategory().getName(),e.getVendorName(),e.getUserUnitName(),e.getVoucherNo(),e.getUnitPrice(),e.getReceipt(),e.getIssue(),e.getBalanceQty(),e.getBalanceValue(),e.getRemarks(),e.getCreatedBy()==null?null:e.getCreatedBy().getUsername(),e.getCreatedAt());}
 }
 public record CreateLedgerRequest(@NotNull LocalDate date,@NotNull Long itemId,String vendorName,String userUnitName,String voucherNo,@NotNull @DecimalMin("0.00") BigDecimal unitPrice,@NotNull @Min(0) Integer receipt,@NotNull @Min(0) Integer issue,String remarks) {}
 public record DemandDto(Long id,Long itemId,String itemName,String customItemName,Integer quantity,String userUnitName,String purpose,StoreDemandStatus status,String requestedBy,LocalDateTime requestedAt,Integer fulfilledQty,String storeRemarks){
  public static DemandDto from(StoreDemand d){return new DemandDto(d.getId(),d.getStoreItem()==null?null:d.getStoreItem().getId(),d.getDisplayItemName(),d.getCustomItemName(),d.getQuantity(),d.getUserUnitName(),d.getPurpose(),d.getStatus(),d.getRequestedBy().getUsername(),d.getRequestedAt(),d.getFulfilledQty(),d.getStoreRemarks());}
 }
 public record CreateDemandRequest(Long itemId,String customItemName,@NotNull @Min(1) Integer quantity,@NotBlank String userUnitName,String purpose) {}
 public record DemandActionRequest(Long itemId,Integer quantity,String remarks) {}
 public record CorrectionDto(Long id,Long ledgerEntryId,String itemName,String reason,StoreCorrectionStatus status,Integer correctedReceipt,Integer correctedIssue,BigDecimal correctedUnitPrice,String correctedVendorName,String correctedUserUnitName,String correctedVoucherNo,String oicRemarks,String raisedBy,String reviewedBy,LocalDateTime createdAt){
  public static CorrectionDto from(StoreCorrectionRequest r){return new CorrectionDto(r.getId(),r.getLedgerEntry().getId(),r.getLedgerEntry().getStoreItem().getName(),r.getReason(),r.getStatus(),r.getCorrectedReceipt(),r.getCorrectedIssue(),r.getCorrectedUnitPrice(),r.getCorrectedVendorName(),r.getCorrectedUserUnitName(),r.getCorrectedVoucherNo(),r.getOicRemarks(),r.getRaisedBy().getUsername(),r.getReviewedBy()==null?null:r.getReviewedBy().getUsername(),r.getCreatedAt());}
 }
 public record CreateCorrectionRequest(@NotBlank String reason,Integer correctedReceipt,Integer correctedIssue,@DecimalMin("0.00") BigDecimal correctedUnitPrice,String correctedVendorName,String correctedUserUnitName,String correctedVoucherNo) {}
 public record ReviewCorrectionRequest(@NotNull Boolean approve,@Size(max=1000) String remarks) {}
 public record StoreSummary(long categories,long catalogueItems,long ledgerRows,long pendingDemands,long pendingCorrections,int totalUnits,double totalValue) {}
 public record UnitDto(Long id,String name){public static UnitDto from(StoreUnit u){return new UnitDto(u.getId(),u.getName());}}
 public record CreateUnitRequest(@NotBlank String name) {}
}
