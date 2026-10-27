package com.example.mmg.controller;

import com.example.mmg.dto.SuperAdminDtos.AdminDto;
import com.example.mmg.dto.SuperAdminDtos.ReassignEmployeeRequest;
import com.example.mmg.service.SuperAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/superadmin")
@RequiredArgsConstructor
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    // All routes here restricted to JS_ADMIN via SecurityConfig

    @GetMapping("/admins")
    public ResponseEntity<List<AdminDto>> getAdmins() {
        return ResponseEntity.ok(superAdminService.getAllAdmins());
    }

    @PostMapping("/employees/{employeeId}/assign-admin")
    public ResponseEntity<Void> reassignEmployee(
            @PathVariable Long employeeId,
            @RequestBody ReassignEmployeeRequest request
    ) {
        superAdminService.reassignEmployee(employeeId, request.adminId());
        return ResponseEntity.ok().build();
    }
}
