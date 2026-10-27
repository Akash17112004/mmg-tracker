package com.example.mmg.service;

import com.example.mmg.dto.ItemUploadResponse;
import com.example.mmg.entity.Category;
import com.example.mmg.entity.Item;
import com.example.mmg.entity.ItemStatus;
import com.example.mmg.entity.StockItem;
import com.example.mmg.entity.User;
import com.example.mmg.entity.Vendor;
import com.example.mmg.repository.CategoryRepository;
import com.example.mmg.repository.ItemRepository;
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

@Service
@RequiredArgsConstructor
public class VendorUploadService {

    private final ItemRepository itemRepository;
    private final VendorRepository vendorRepository;
    private final CategoryRepository categoryRepository;
    private final StockItemRepository stockItemRepository;
    private final StockService stockService;

    private static final String UPLOAD_DIR = "uploads";

    @Transactional
    public ItemUploadResponse uploadItem(
            Integer vendorId,
            Integer categoryId,
            String itemName,
            String description,
            Long stockItemId,
            Integer quantityUsed,
            MultipartFile file,
            User uploadedBy
    ) throws IOException {

        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found: " + vendorId));
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found: " + categoryId));

        StockItem stockItem = null;
        if (stockItemId != null) {
            stockItem = stockItemRepository.findById(stockItemId)
                    .orElseThrow(() -> new IllegalArgumentException("Stock item not found: " + stockItemId));
            int qty = quantityUsed != null ? quantityUsed : 1;
            stockService.consumeStock(stockItem, qty);
        }

        String storedPath = null;
        if (file != null && !file.isEmpty()) {
            storedPath = storeFile(file);
        }

        Item item = new Item();
        item.setVendor(vendor);
        item.setCategory(category);
        item.setItemName(itemName);
        item.setDescription(description);
        item.setDocumentPath(storedPath);
        item.setStatus(ItemStatus.UPLOADED);
        item.setStockItem(stockItem);
        item.setQuantityUsed(stockItem != null ? (quantityUsed != null ? quantityUsed : 1) : null);
        item.setUploadedBy(uploadedBy);

        Item saved = itemRepository.save(item);

        return new ItemUploadResponse(saved.getId(), saved.getItemName(), saved.getStatus().name(), saved.getDocumentPath());
    }

    private String storeFile(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalName = file.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        }

        String uniqueName = UUID.randomUUID() + extension;
        Path targetPath = uploadPath.resolve(uniqueName);
        Files.copy(file.getInputStream(), targetPath);

        return targetPath.toString();
    }
}
