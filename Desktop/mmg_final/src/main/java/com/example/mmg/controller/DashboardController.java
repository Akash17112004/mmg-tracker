package com.example.mmg.controller;

import com.example.mmg.dto.DashboardSummaryDto;
import com.example.mmg.dto.ItemDashboardDto;
import com.example.mmg.entity.User;
import com.example.mmg.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    // JS_ADMIN sees everything (null = unrestricted); a regular ADMIN is scoped to their own team
    private Long ownerScope(User currentUser) {
        return (currentUser.getRole().getName().equalsIgnoreCase("JS_ADMIN") || currentUser.getRole().getName().equalsIgnoreCase("DIRECTOR_ADMIN")) ? null : currentUser.getId();
    }

    @GetMapping("/api/dashboard/summary")
    public ResponseEntity<DashboardSummaryDto> getSummary(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(dashboardService.getSummary(ownerScope(currentUser)));
    }

    @GetMapping("/api/dashboard/items")
    public ResponseEntity<List<ItemDashboardDto>> getAllItems(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(dashboardService.getAllItems(ownerScope(currentUser)));
    }

    @GetMapping("/api/dashboard/items/search")
    public ResponseEntity<List<ItemDashboardDto>> searchItems(
            @RequestParam("q") String query, @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(dashboardService.searchItems(query, ownerScope(currentUser)));
    }

    @GetMapping("/api/dashboard/items/filtered")
    public ResponseEntity<com.example.mmg.dto.PagedItemsDto> getFilteredItems(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(dashboardService.getFilteredItems(status, page, size, ownerScope(currentUser)));
    }

    // Employee-scoped dashboard — only their own items, never someone else's
    @GetMapping("/api/dashboard/employee/summary")
    public ResponseEntity<DashboardSummaryDto> getMySummary(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(dashboardService.getEmployeeSummary(currentUser.getId()));
    }

    @GetMapping("/api/dashboard/employee/items")
    public ResponseEntity<List<ItemDashboardDto>> getMyItems(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(dashboardService.getEmployeeItems(currentUser.getId()));
    }
}
