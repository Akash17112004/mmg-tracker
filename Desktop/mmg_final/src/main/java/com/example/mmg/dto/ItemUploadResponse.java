package com.example.mmg.dto;

public record ItemUploadResponse(
        Long itemId,
        String itemName,
        String status,
        String documentPath
) {
}
