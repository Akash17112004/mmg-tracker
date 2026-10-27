package com.example.mmg.dto;

import com.example.mmg.entity.Item;

public record ItemDashboardDto(
        Long id,
        String itemName,
        String status,
        String employeeName,
        boolean hasDocument,
        String assignedByUsername
) {
    public static ItemDashboardDto fromEntity(Item item) {
        return new ItemDashboardDto(
                item.getId(),
                item.getItemName(),
                item.getStatus().name(),
                item.getAssignedEmployee() != null ? item.getAssignedEmployee().getUsername() : null,
                item.getDocumentPath() != null,
                item.getAssignedBy() != null ? item.getAssignedBy().getUsername() : null
        );
    }
}
