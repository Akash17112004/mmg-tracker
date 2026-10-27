package com.example.mmg.dto;

import java.util.List;

public record PagedItemsDto(
        List<ItemDashboardDto> items,
        int page,
        int totalPages,
        long totalItems
) {
}
