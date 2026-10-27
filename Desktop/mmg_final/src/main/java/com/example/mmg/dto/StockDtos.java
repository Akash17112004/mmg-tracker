package com.example.mmg.dto;

import com.example.mmg.entity.StockItem;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class StockDtos {

    public record StockItemDto(
            Long id, String name, Integer quantity, String unit,
            Integer minThreshold, boolean lowStock
    ) {
        public static StockItemDto fromEntity(StockItem item) {
            return new StockItemDto(
                    item.getId(), item.getName(), item.getQuantity(), item.getUnit(),
                    item.getMinThreshold(), item.isLowStock()
            );
        }
    }

    public record CreateStockItemRequest(
            @NotBlank String name,
            @NotNull Integer quantity,
            String unit,
            @NotNull Integer minThreshold
    ) {
    }

    public record AdjustStockRequest(@NotNull Integer delta) {
    }

    public record StockSummaryDto(long totalItems, long lowStockCount, long totalQuantity) {
    }

    public record StockMovementDto(Integer delta, String reason, String changedBy, java.time.LocalDateTime changedAt) {
    }
}
