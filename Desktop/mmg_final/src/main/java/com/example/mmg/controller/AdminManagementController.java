package com.example.mmg.controller;

import com.example.mmg.dto.AdminCreateDtos.CreateCategoryRequest;
import com.example.mmg.dto.AdminCreateDtos.CreateUserRequest;
import com.example.mmg.dto.AdminCreateDtos.ResetPasswordRequest;
import com.example.mmg.entity.Category;
import com.example.mmg.entity.User;
import com.example.mmg.service.AdminDeleteService;
import com.example.mmg.service.AdminManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminManagementController {

    private final AdminManagementService adminManagementService;
    private final AdminDeleteService adminDeleteService;

    // All routes here already locked to ADMIN/JS_ADMIN role via /api/admin/** in SecurityConfig

    @PostMapping("/users")
    public ResponseEntity<Void> createUser(@Valid @RequestBody CreateUserRequest request, @AuthenticationPrincipal User currentUser) {
        adminManagementService.createUser(request.username(), request.password(), request.role(), request.adminId(), currentUser);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@Valid @RequestBody CreateCategoryRequest request) {
        return ResponseEntity.ok(adminManagementService.createCategory(request.name()));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        adminDeleteService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long itemId) {
        adminDeleteService.deleteItem(itemId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users/{userId}/reset-password")
    public ResponseEntity<Void> resetPassword(
            @PathVariable Long userId,
            @Valid @RequestBody ResetPasswordRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        adminManagementService.resetPassword(userId, request.newPassword(), currentUser);
        return ResponseEntity.ok().build();
    }
}
