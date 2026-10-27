package com.example.mmg.dto;

import jakarta.validation.constraints.NotBlank;

public class AuthDtos {

    public record LoginRequest(
            @NotBlank(message = "Username is required") String username,
            @NotBlank(message = "Password is required") String password
    ) {
    }

    public record LoginResponse(
            String token,
            String username,
            String role
    ) {
    }

    public record UpdateProfileRequest(
            String newUsername,
            String currentPassword,
            String newPassword
    ) {
    }
}
