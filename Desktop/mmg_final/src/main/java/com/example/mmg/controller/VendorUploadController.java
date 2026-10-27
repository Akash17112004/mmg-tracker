package com.example.mmg.controller;

import com.example.mmg.dto.ItemDashboardDto;
import com.example.mmg.dto.ItemUploadResponse;
import com.example.mmg.entity.User;
import com.example.mmg.repository.ItemRepository;
import com.example.mmg.service.VendorUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/vendor")
@RequiredArgsConstructor
public class VendorUploadController {

    private final VendorUploadService vendorUploadService;
    private final ItemRepository itemRepository;

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<ItemUploadResponse> upload(
            @RequestParam("vendorId") Integer vendorId,
            @RequestParam("categoryId") Integer categoryId,
            @RequestParam("itemName") String itemName,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "stockItemId", required = false) Long stockItemId,
            @RequestParam(value = "quantityUsed", required = false) Integer quantityUsed,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @AuthenticationPrincipal User currentUser
    ) throws IOException {
        return ResponseEntity.ok(
                vendorUploadService.uploadItem(vendorId, categoryId, itemName, description, stockItemId, quantityUsed, file, currentUser)
        );
    }

    // Items this logged-in vendor account has personally submitted, regardless of which
    // vendor company was picked in the upload form
    @GetMapping("/my-uploads")
    public ResponseEntity<List<ItemDashboardDto>> myUploads(@AuthenticationPrincipal User currentUser) {
        List<ItemDashboardDto> items = itemRepository.findByUploadedBy_IdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(ItemDashboardDto::fromEntity)
                .toList();
        return ResponseEntity.ok(items);
    }
}
