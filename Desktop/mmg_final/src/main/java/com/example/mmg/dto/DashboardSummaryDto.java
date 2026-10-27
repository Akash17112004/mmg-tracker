package com.example.mmg.dto;

public record DashboardSummaryDto(
        long uploaded,
        long assigned,
        long pending,
        long inProgress,
        long completed,
        long total
) {
}
