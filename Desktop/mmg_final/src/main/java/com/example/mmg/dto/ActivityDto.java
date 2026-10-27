package com.example.mmg.dto;

import java.time.LocalDateTime;

public record ActivityDto(
        Long itemId,
        String itemName,
        String status,
        String employeeName,
        LocalDateTime changedAt
) {
}
