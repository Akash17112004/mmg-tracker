package com.example.mmg.dto;

import com.example.mmg.entity.Item;

public record ItemDetailDto(
        Long id,
        String itemName,
        String description,
        String status,
        String categoryName,
        String employeeName,
        boolean hasDocument,
        String createdAt,
        String assignedByUsername
) {
    public static ItemDetailDto fromEntity(Item item) {
        return new ItemDetailDto(
                item.getId(),
                item.getItemName(),
                item.getDescription(),
                item.getStatus().name(),
                item.getCategory() != null ? item.getCategory().getName() : null,
                item.getAssignedEmployee() != null ? item.getAssignedEmployee().getUsername() : null,
                item.getDocumentPath() != null,
                item.getCreatedAt() != null ? item.getCreatedAt().toString() : null,
                item.getAssignedBy() != null ? item.getAssignedBy().getUsername() : null
        );
    }
}
