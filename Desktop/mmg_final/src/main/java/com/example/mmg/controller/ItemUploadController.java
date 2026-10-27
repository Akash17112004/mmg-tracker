package com.example.mmg.controller;

import com.example.mmg.dto.ItemUploadResponse;
import com.example.mmg.entity.User;
import com.example.mmg.service.ItemUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemUploadController {
    private final ItemUploadService uploadService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ItemUploadResponse> upload(
            @RequestParam("categoryId") Integer categoryId,
            @RequestParam("itemName") String itemName,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "stockItemId", required = false) Long stockItemId,
            @RequestParam(value = "quantityUsed", required = false) Integer quantityUsed,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            @RequestParam(value = "remarks", required = false) List<String> remarks,
            // Backward compatibility for the previous single-file form/API.
            @RequestParam(value = "file", required = false) MultipartFile file,
            @AuthenticationPrincipal User currentUser
    ) throws IOException {
        List<MultipartFile> uploadFiles = new ArrayList<>();
        if (files != null) uploadFiles.addAll(files);
        if (file != null && !file.isEmpty()) uploadFiles.add(file);
        return ResponseEntity.ok(uploadService.uploadItem(
                categoryId, itemName, description, stockItemId, quantityUsed, uploadFiles, remarks, currentUser
        ));
    }
}
