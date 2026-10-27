package com.example.mmg.dto;

import com.example.mmg.entity.ItemDocument;

public record ItemDocumentDto(
        Long id,
        String originalFilename,
        String remarks,
        String uploadedBy,
        String uploadedAt,
        String updatedBy,
        String updatedAt,
        boolean legacy
) {
    public static ItemDocumentDto fromEntity(ItemDocument document) {
        return new ItemDocumentDto(
                document.getId(),
                document.getOriginalFilename(),
                document.getRemarks(),
                document.getUploadedBy() != null ? document.getUploadedBy().getUsername() : "System",
                document.getCreatedAt() != null ? document.getCreatedAt().toString() : null,
                document.getUpdatedBy() != null ? document.getUpdatedBy().getUsername() : null,
                document.getUpdatedAt() != null && !document.getUpdatedAt().equals(document.getCreatedAt())
                        ? document.getUpdatedAt().toString() : null,
                false
        );
    }
}
