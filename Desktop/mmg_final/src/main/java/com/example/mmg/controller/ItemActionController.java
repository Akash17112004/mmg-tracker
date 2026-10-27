package com.example.mmg.controller;

import com.example.mmg.dto.ItemActionDtos.AssignRequest;
import com.example.mmg.dto.ItemActionDtos.StatusUpdateRequest;
import com.example.mmg.entity.User;
import com.example.mmg.service.ItemActionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemActionController {

    private final ItemActionService itemActionService;

    // Admin/JS_ADMIN — enforced by SecurityConfig; ownership validated in service layer
    @PostMapping("/{itemId}/assign")
    public ResponseEntity<Void> assign(
            @PathVariable Long itemId,
            @Valid @RequestBody AssignRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        itemActionService.assignItem(itemId, request.employeeId(), currentUser);
        return ResponseEntity.ok().build();
    }

    // Employee (own items) or Admin/JS_ADMIN (any item)
    @PostMapping("/{itemId}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable Long itemId,
            @Valid @RequestBody StatusUpdateRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        boolean isAdmin = currentUser.getRole().getName().equalsIgnoreCase("ADMIN")
                || (currentUser.getRole().getName().equalsIgnoreCase("JS_ADMIN") || currentUser.getRole().getName().equalsIgnoreCase("DIRECTOR_ADMIN"));
        itemActionService.updateStatus(itemId, request.status(), currentUser.getId(), isAdmin);
        return ResponseEntity.ok().build();
    }
}
