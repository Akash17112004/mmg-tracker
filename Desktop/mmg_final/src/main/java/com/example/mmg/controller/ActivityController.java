package com.example.mmg.controller;

import com.example.mmg.dto.ActivityDto;
import com.example.mmg.entity.ItemStatusHistory;
import com.example.mmg.entity.User;
import com.example.mmg.repository.ItemStatusHistoryRepository;
import com.example.mmg.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/activity")
@RequiredArgsConstructor
public class ActivityController {

    private final ItemStatusHistoryRepository historyRepository;
    private final UserRepository userRepository;

    // JS_ADMIN sees all activity; a regular ADMIN sees only activity for their own employees;
    // an employee sees only activity on their own assigned items.
    // Passing employeeId narrows the feed to just that one employee — used when an admin clicks
    // an employee's name on the Employees page.
    @GetMapping
    public ResponseEntity<List<ActivityDto>> getRecentActivity(
            @RequestParam(required = false) Long employeeId,
            @AuthenticationPrincipal User currentUser
    ) {
        String roleName = currentUser.getRole().getName();
        boolean isSuperAdmin = (roleName.equalsIgnoreCase("JS_ADMIN") || roleName.equalsIgnoreCase("DIRECTOR_ADMIN"));
        boolean isAdmin = roleName.equalsIgnoreCase("ADMIN");
        List<ItemStatusHistory> history;

        if (employeeId != null) {
            if (!isSuperAdmin && !isAdmin) {
                throw new SecurityException("Not authorized to view another employee's activity");
            }
            if (isAdmin) {
                User target = userRepository.findById(employeeId)
                        .orElseThrow(() -> new IllegalArgumentException("Employee not found: " + employeeId));
                if (target.getAssignedAdmin() == null || !target.getAssignedAdmin().getId().equals(currentUser.getId())) {
                    throw new SecurityException("You can only view activity for your own employees");
                }
            }
            history = historyRepository.findTop20ByItem_AssignedEmployee_IdOrderByChangedAtDesc(employeeId);
        } else if (isSuperAdmin) {
            history = historyRepository.findTop20ByOrderByChangedAtDesc();
        } else if (isAdmin) {
            history = historyRepository.findTop20ScopedToAdmin(currentUser.getId());
            if (history.size() > 20) history = history.subList(0, 20);
        } else {
            history = historyRepository.findTop20ByItem_AssignedEmployee_IdOrderByChangedAtDesc(currentUser.getId());
        }

        List<ActivityDto> dtos = history.stream()
                .map(h -> new ActivityDto(
                        h.getItem().getId(),
                        h.getItem().getItemName(),
                        h.getStatus().name(),
                        h.getItem().getAssignedEmployee() != null ? h.getItem().getAssignedEmployee().getUsername() : null,
                        h.getChangedAt()
                ))
                .toList();

        return ResponseEntity.ok(dtos);
    }
}
