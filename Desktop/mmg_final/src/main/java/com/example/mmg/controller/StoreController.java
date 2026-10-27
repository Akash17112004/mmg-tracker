package com.example.mmg.controller;

import com.example.mmg.dto.StoreDtos.*;
import com.example.mmg.service.StoreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/store")
@RequiredArgsConstructor
public class StoreController {
 private final StoreService service;
 @GetMapping("/summary") public StoreSummary summary(){return service.summary();}
 @GetMapping("/categories") public List<CategoryDto> categories(){return service.categories();}
 @PostMapping("/categories") public CategoryDto createCategory(@Valid @RequestBody CreateCategoryRequest r){return service.createCategory(r);}
 @GetMapping("/items") public List<StoreItemDto> items(@RequestParam(required=false) String q){return service.items(q);}
 @PostMapping("/items") public StoreItemDto createItem(@Valid @RequestBody CreateStoreItemRequest r){return service.createItem(r);}
 @GetMapping("/units") public List<UnitDto> units(){return service.units();}
 @PostMapping("/units") public UnitDto createUnit(@Valid @RequestBody CreateUnitRequest r){return service.createUnit(r);}
 @GetMapping("/ledger") public List<LedgerDto> ledger(@RequestParam(required=false) String q){return service.ledger(q);}
 @PostMapping("/ledger") public LedgerDto addLedger(@Valid @RequestBody CreateLedgerRequest r){return service.addLedger(r);}
 @DeleteMapping("/ledger/{id}") public ResponseEntity<Void> deleteLedger(@PathVariable Long id){service.deleteLedger(id);return ResponseEntity.noContent().build();}
 @GetMapping("/demands") public List<DemandDto> demands(){return service.demands();}
 @PostMapping("/demands") public DemandDto createDemand(@Valid @RequestBody CreateDemandRequest r){return service.createDemand(r);}
 @PostMapping("/demands/{id}/approve") public DemandDto approveDemand(@PathVariable Long id,@RequestBody DemandActionRequest r){return service.approveDemand(id,r);}
 @PostMapping("/demands/{id}/reject") public DemandDto rejectDemand(@PathVariable Long id,@RequestParam(required=false) String remarks){return service.rejectDemand(id,remarks);}
 @PostMapping("/demands/{id}/fulfill") public DemandDto fulfillDemand(@PathVariable Long id,@RequestBody DemandActionRequest r){return service.fulfillDemand(id,r);}
 @GetMapping("/corrections") public List<CorrectionDto> corrections(){return service.corrections();}
 @PostMapping("/ledger/{ledgerId}/corrections") public CorrectionDto raiseCorrection(@PathVariable Long ledgerId,@Valid @RequestBody CreateCorrectionRequest r){return service.raiseCorrection(ledgerId,r);}
 @PostMapping("/corrections/{id}/review") public CorrectionDto reviewCorrection(@PathVariable Long id,@Valid @RequestBody ReviewCorrectionRequest r){return service.reviewCorrection(id,r);}
 @PostMapping("/corrections/{id}/apply") public CorrectionDto applyCorrection(@PathVariable Long id){return service.applyCorrection(id);}
}
