package com.example.mmg.dto;

import com.example.mmg.entity.ItemStatusHistory;

import java.time.LocalDateTime;

public record ItemHistoryDto(String status, LocalDateTime changedAt) {
    public static ItemHistoryDto fromEntity(ItemStatusHistory history) {
        return new ItemHistoryDto(history.getStatus().name(), history.getChangedAt());
    }
}
