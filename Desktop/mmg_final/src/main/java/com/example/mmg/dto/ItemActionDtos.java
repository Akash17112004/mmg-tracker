package com.example.mmg.dto;

import jakarta.validation.constraints.NotNull;

public class ItemActionDtos {

    public record AssignRequest(@NotNull Long employeeId) {
    }

    public record StatusUpdateRequest(@NotNull String status) {
    }
}
