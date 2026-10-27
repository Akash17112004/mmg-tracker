package com.example.mmg.service;

import com.example.mmg.dto.ItemUploadResponse;
import com.example.mmg.entity.Category;
import com.example.mmg.entity.Item;
import com.example.mmg.entity.ItemDocument;
import com.example.mmg.entity.ItemStatus;
import com.example.mmg.entity.StockItem;
import com.example.mmg.entity.User;
import com.example.mmg.entity.Vendor;
import com.example.mmg.repository.CategoryRepository;
import com.example.mmg.repository.ItemRepository;
import com.example.mmg.repository.ItemDocumentRepository;
import com.example.mmg.repository.StockItemRepository;
import com.example.mmg.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ItemUploadService {

    private final ItemRepository itemRepository;
    private final ItemDocumentRepository documentRepository;
    private final VendorRepository vendorRepository;
    private final CategoryRepository categoryRepository;
    private final StockItemRepository stockItemRepository;
    private final StockService stockService;

    private static final Path UPLOAD_DIR = Paths.get("uploads").toAbsolutePath().normalize();

    @Transactional
    public ItemUploadResponse uploadItem(
            Integer categoryId,
            String itemName,
            String description,
            Long stockItemId,
            Integer quantityUsed,
            List<MultipartFile> files,
            List<String> remarks,
            User uploadedBy
    ) throws IOException {

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found: " + categoryId));

        StockItem stockItem = null;
        if (stockItemId != null) {
            stockItem = stockItemRepository.findById(stockItemId)
                    .orElseThrow(() -> new IllegalArgumentException("Stock item not found: " + stockItemId));
            int qty = quantityUsed != null ? quantityUsed : 1;
            stockService.consumeStock(stockItem, qty);
        }

        Item item = new Item();
        // The legacy vendor relation remains internal for databases whose schema still requires it.
        Vendor internalVendor = vendorRepository.findFirstByNameIgnoreCase("Internal Item Tracking")
                .orElseGet(() -> {
                    Vendor created = new Vendor();
                    created.setName("Internal Item Tracking");
                    return vendorRepository.save(created);
                });
        item.setVendor(internalVendor);
        item.setCategory(category);
        item.setItemName(itemName);
        item.setDescription(description);
        item.setStatus(ItemStatus.UPLOADED);
        item.setStockItem(stockItem);
        item.setQuantityUsed(stockItem != null ? (quantityUsed != null ? quantityUsed : 1) : null);
        item.setUploadedBy(uploadedBy);

        Item saved = itemRepository.save(item);
        String firstStoredPath = null;
        if (files != null) {
            for (int index = 0; index < files.size(); index++) {
                MultipartFile file = files.get(index);
                if (file == null || file.isEmpty()) continue;

                String storedPath = storeFile(file);
                if (firstStoredPath == null) firstStoredPath = storedPath;
                String originalName = safeOriginalFilename(file.getOriginalFilename());
                ItemDocument document = new ItemDocument();
                document.setItem(saved);
                document.setOriginalFilename(originalName);
                document.setStoredPath(storedPath);
                document.setRemarks(remarks != null && index < remarks.size() ? cleanRemarks(remarks.get(index)) : null);
                document.setUploadedBy(uploadedBy);
                documentRepository.save(document);
            }
        }

        // Retain the original single-document path for older screens and existing clients.
        if (firstStoredPath != null) {
            saved.setDocumentPath(firstStoredPath);
            itemRepository.save(saved);
        }

        return new ItemUploadResponse(saved.getId(), saved.getItemName(), saved.getStatus().name(), saved.getDocumentPath());
    }

    private String storeFile(MultipartFile file) throws IOException {
        Files.createDirectories(UPLOAD_DIR);

        // Work from the cleaned basename only. Never let a supplied filename contribute
        // directories or path traversal segments to the stored destination.
        String originalName = safeOriginalFilename(file.getOriginalFilename());
        String extension = "";
        int dot = originalName.lastIndexOf('.');
        if (dot >= 0) {
            extension = originalName.substring(dot);
            if (extension.length() > 20 || extension.contains("/") || extension.contains("\\")) {
                extension = "";
            }
        }

        Path targetPath = UPLOAD_DIR.resolve(UUID.randomUUID() + extension).normalize();
        if (!targetPath.startsWith(UPLOAD_DIR)) {
            throw new SecurityException("Invalid upload filename");
        }
        try (var inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetPath);
        }
        return targetPath.toString();
    }

    private String safeOriginalFilename(String filename) {
        String cleaned = filename == null ? "document" : filename.replace('\\', '/');
        int slash = cleaned.lastIndexOf('/');
        if (slash >= 0) cleaned = cleaned.substring(slash + 1);
        cleaned = cleaned.replaceAll("[\\r\\n\"]", "_").trim();
        if (cleaned.isBlank()) cleaned = "document";
        return cleaned.length() > 255 ? cleaned.substring(cleaned.length() - 255) : cleaned;
    }

    private String cleanRemarks(String remarks) {
        if (remarks == null) return null;
        String value = remarks.trim();
        if (value.length() > 2000) throw new IllegalArgumentException("Remarks must be 2000 characters or fewer");
        return value.isEmpty() ? null : value;
    }
}
