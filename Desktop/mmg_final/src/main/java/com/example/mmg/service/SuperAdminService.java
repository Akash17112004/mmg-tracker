package com.example.mmg.service;

import com.example.mmg.dto.SuperAdminDtos.AdminDto;
import com.example.mmg.entity.User;
import com.example.mmg.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SuperAdminService {

    private final UserRepository userRepository;

    public List<AdminDto> getAllAdmins() {
        return userRepository.findAllAdmins().stream()
                .map(u -> new AdminDto(u.getId(), u.getUsername()))
                .toList();
    }

    public void reassignEmployee(Long employeeId, Long newAdminId) {
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found: " + employeeId));

        if (!employee.getRole().getName().equalsIgnoreCase("EMPLOYEE")) {
            throw new IllegalArgumentException("User " + employeeId + " is not an employee");
        }

        if (newAdminId == null) {
            employee.setAssignedAdmin(null);
        } else {
            User admin = userRepository.findById(newAdminId)
                    .orElseThrow(() -> new IllegalArgumentException("Admin not found: " + newAdminId));
            employee.setAssignedAdmin(admin);
        }

        userRepository.save(employee);
    }
}
