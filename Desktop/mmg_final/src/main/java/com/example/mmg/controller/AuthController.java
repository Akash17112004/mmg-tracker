package com.example.mmg.controller;

import com.example.mmg.dto.AuthDtos.LoginRequest;
import com.example.mmg.dto.AuthDtos.LoginResponse;
import com.example.mmg.dto.AuthDtos.UpdateProfileRequest;
import com.example.mmg.entity.User;
import com.example.mmg.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PutMapping("/me")
    public ResponseEntity<Void> updateProfile(
            @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        authService.updateProfile(currentUser.getId(), request);
        return ResponseEntity.ok().build();
    }
}
