package com.example.mmg.dto;

import jakarta.validation.constraints.NotNull;

public class SuperAdminDtos {

    public record AdminDto(Long id, String username) {
    }

    public record ReassignEmployeeRequest(Long adminId) { // null = unassign
    }
}
