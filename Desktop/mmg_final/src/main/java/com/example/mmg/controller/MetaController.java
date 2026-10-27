package com.example.mmg.controller;

import com.example.mmg.dto.CategoryDto;
import com.example.mmg.dto.StockDtos.StockItemDto;
import com.example.mmg.repository.CategoryRepository;
import com.example.mmg.repository.StockItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/meta")
@RequiredArgsConstructor
public class MetaController {

    private final CategoryRepository categoryRepository;
    private final StockItemRepository stockItemRepository;

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDto>> getCategories() {
        List<CategoryDto> categories = categoryRepository.findAll().stream()
                .map(c -> new CategoryDto(c.getId(), c.getName()))
                .toList();
        return ResponseEntity.ok(categories);
    }

    // Optional stock materials can be linked when uploading an item
    @GetMapping("/stock-items")
    public ResponseEntity<List<StockItemDto>> getStockItems() {
        return ResponseEntity.ok(stockItemRepository.findAll().stream()
                .map(StockItemDto::fromEntity)
                .toList());
    }
}
