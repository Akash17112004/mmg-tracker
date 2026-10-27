package com.example.mmg.service;

import com.example.mmg.entity.Item;
import com.example.mmg.entity.ItemStatus;
import com.example.mmg.entity.ItemStatusHistory;
import com.example.mmg.entity.User;
import com.example.mmg.repository.ItemRepository;
import com.example.mmg.repository.ItemStatusHistoryRepository;
import com.example.mmg.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ItemActionService {

    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final ItemStatusHistoryRepository historyRepository;

    @Transactional
    public void assignItem(Long itemId, Long employeeId, User actingAdmin) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + itemId));
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found: " + employeeId));

        boolean isSuperAdmin = (actingAdmin.getRole().getName().equalsIgnoreCase("JS_ADMIN") || actingAdmin.getRole().getName().equalsIgnoreCase("DIRECTOR_ADMIN"));

        // Regular admins can only assign items to employees they own; JS_ADMIN can assign to anyone
        if (!isSuperAdmin) {
            if (employee.getAssignedAdmin() == null || !employee.getAssignedAdmin().getId().equals(actingAdmin.getId())) {
                throw new SecurityException("You can only assign items to employees on your own team");
            }
        }

        item.setAssignedEmployee(employee);
        item.setAssignedBy(actingAdmin);
        item.setStatus(ItemStatus.ASSIGNED);
        itemRepository.save(item);

        logHistory(item, ItemStatus.ASSIGNED);
    }

    @Transactional
    public void updateStatus(Long itemId, String newStatusRaw, Long requestingEmployeeId, boolean isAdmin) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + itemId));

        // Employees can only change status on their own assigned items
        if (!isAdmin) {
            if (item.getAssignedEmployee() == null || !item.getAssignedEmployee().getId().equals(requestingEmployeeId)) {
                throw new SecurityException("You are not assigned to this item");
            }
        }

        ItemStatus newStatus;
        try {
            newStatus = ItemStatus.valueOf(newStatusRaw.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid status: " + newStatusRaw);
        }

        item.setStatus(newStatus);
        itemRepository.save(item);

        logHistory(item, newStatus);
    }

    private void logHistory(Item item, ItemStatus status) {
        ItemStatusHistory history = new ItemStatusHistory();
        history.setItem(item);
        history.setStatus(status);
        historyRepository.save(history);
    }
}
