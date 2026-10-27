package com.example.mmg.controller;

import com.example.mmg.dto.EmployeeSummaryDto;
import com.example.mmg.entity.User;
import com.example.mmg.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    // Admin/JS_ADMIN only — /api/admin/** locked in SecurityConfig; scoping applied here
    @GetMapping
    public ResponseEntity<List<EmployeeSummaryDto>> getEmployees(@AuthenticationPrincipal User currentUser) {
        Long ownerAdminId = (currentUser.getRole().getName().equalsIgnoreCase("JS_ADMIN") || currentUser.getRole().getName().equalsIgnoreCase("DIRECTOR_ADMIN")) ? null : currentUser.getId();
        return ResponseEntity.ok(employeeService.getEmployeesWithCounts(ownerAdminId));
    }
}
