package com.example.mmg.service;

import com.example.mmg.dto.StockDtos.*;
import com.example.mmg.entity.StockItem;
import com.example.mmg.entity.StockMovement;
import com.example.mmg.repository.StockItemRepository;
import com.example.mmg.repository.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StockService {

    private final StockItemRepository stockItemRepository;
    private final StockMovementRepository movementRepository;

    public List<StockItemDto> getAllItems() {
        return stockItemRepository.findAll().stream().map(StockItemDto::fromEntity).toList();
    }

    public List<StockItemDto> searchItems(String query) {
        return stockItemRepository.findByNameContainingIgnoreCase(query).stream()
                .map(StockItemDto::fromEntity).toList();
    }

    public List<StockItemDto> getLowStockAlerts() {
        return stockItemRepository.findAll().stream()
                .filter(StockItem::isLowStock)
                .map(StockItemDto::fromEntity)
                .toList();
    }

    public List<StockMovementDto> getHistory(Long stockItemId) {
        return movementRepository.findByStockItem_IdOrderByChangedAtDesc(stockItemId).stream()
                .map(m -> new StockMovementDto(m.getDelta(), m.getReason(), m.getChangedBy(), m.getChangedAt()))
                .toList();
    }

    public StockSummaryDto getSummary() {
        List<StockItem> all = stockItemRepository.findAll();
        long totalItems = all.size();
        long lowStock = all.stream().filter(StockItem::isLowStock).count();
        long totalQty = all.stream().mapToLong(StockItem::getQuantity).sum();
        return new StockSummaryDto(totalItems, lowStock, totalQty);
    }

    public StockItemDto createItem(CreateStockItemRequest request) {
        StockItem item = new StockItem();
        item.setName(request.name());
        item.setQuantity(request.quantity());
        item.setUnit(request.unit() != null && !request.unit().isBlank() ? request.unit() : "pcs");
        item.setMinThreshold(request.minThreshold());
        StockItem saved = stockItemRepository.save(item);
        logMovement(saved, request.quantity(), "INITIAL_STOCK");
        return StockItemDto.fromEntity(saved);
    }

    @Transactional
    public StockItemDto adjustQuantity(Long itemId, Integer delta) {
        StockItem item = stockItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Stock item not found: " + itemId));

        int newQty = item.getQuantity() + delta;
        if (newQty < 0) {
            throw new IllegalArgumentException("Quantity cannot go below zero");
        }
        item.setQuantity(newQty);
        StockItem saved = stockItemRepository.save(item);
        logMovement(saved, delta, "MANUAL_ADJUST");
        return StockItemDto.fromEntity(saved);
    }

    // Called when an item upload consumes stock — throws if not enough available
    @Transactional
    public void consumeStock(StockItem item, int quantity) {
        if (item.getQuantity() < quantity) {
            throw new IllegalArgumentException(
                    "Not enough stock for " + item.getName() + " (have " + item.getQuantity() + ", need " + quantity + ")");
        }
        item.setQuantity(item.getQuantity() - quantity);
        stockItemRepository.save(item);
        logMovement(item, -quantity, "CONSUMED_BY_ITEM");
    }

    public void deleteItem(Long itemId) {
        if (!stockItemRepository.existsById(itemId)) {
            throw new IllegalArgumentException("Stock item not found: " + itemId);
        }
        stockItemRepository.deleteById(itemId);
    }

    private void logMovement(StockItem item, int delta, String reason) {
        StockMovement movement = new StockMovement();
        movement.setStockItem(item);
        movement.setDelta(delta);
        movement.setReason(reason);
        String username = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getName()
                : "system";
        movement.setChangedBy(username);
        movementRepository.save(movement);
    }
}
