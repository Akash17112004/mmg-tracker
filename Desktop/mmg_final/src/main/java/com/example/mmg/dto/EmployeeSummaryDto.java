package com.example.mmg.dto;

public record EmployeeSummaryDto(
        Long id,
        String username,
        long assigned,
        long pending,
        long inProgress,
        long completed,
        long total,
        String adminUsername
) {
}
