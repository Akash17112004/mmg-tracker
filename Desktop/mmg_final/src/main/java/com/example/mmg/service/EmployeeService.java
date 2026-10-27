package com.example.mmg.service;

import com.example.mmg.dto.EmployeeSummaryDto;
import com.example.mmg.entity.ItemStatus;
import com.example.mmg.entity.User;
import com.example.mmg.repository.ItemRepository;
import com.example.mmg.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final UserRepository userRepository;
    private final ItemRepository itemRepository;

    // ownerAdminId = null means JS_ADMIN — see every employee across all admins
    public List<EmployeeSummaryDto> getEmployeesWithCounts(Long ownerAdminId) {
        List<User> employees = ownerAdminId == null
                ? userRepository.findByRole_NameIgnoreCase("EMPLOYEE")
                : userRepository.findByRole_NameIgnoreCaseAndAssignedAdmin_Id("EMPLOYEE", ownerAdminId);

        return employees.stream().map(emp -> {
            long assigned = itemRepository.countByAssignedEmployee_IdAndStatus(emp.getId(), ItemStatus.ASSIGNED);
            long pending = itemRepository.countByAssignedEmployee_IdAndStatus(emp.getId(), ItemStatus.PENDING);
            long inProgress = itemRepository.countByAssignedEmployee_IdAndStatus(emp.getId(), ItemStatus.IN_PROGRESS);
            long completed = itemRepository.countByAssignedEmployee_IdAndStatus(emp.getId(), ItemStatus.COMPLETED);
            long total = assigned + pending + inProgress + completed;
            String adminUsername = emp.getAssignedAdmin() != null ? emp.getAssignedAdmin().getUsername() : null;

            return new EmployeeSummaryDto(emp.getId(), emp.getUsername(), assigned, pending, inProgress, completed, total, adminUsername);
        }).toList();
    }
}
