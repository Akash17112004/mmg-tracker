package com.example.mmg.dto;

import jakarta.validation.constraints.NotBlank;

public class AdminCreateDtos {

    public record CreateUserRequest(
            @NotBlank String username,
            @NotBlank String password,
            @NotBlank String role, // "JS_ADMIN", "DIRECTOR_ADMIN", "ADMIN", "EMPLOYEE", "OIC_STORE", or "BILLING"
            Long adminId // optional: JS_ADMIN can explicitly pick which admin owns a new employee
    ) {
    }

    public record ResetPasswordRequest(@NotBlank String newPassword) {
    }

    public record CreateCategoryRequest(@NotBlank String name) {
    }
}
