package com.example.mmg.service;

import com.example.mmg.entity.User;
import com.example.mmg.repository.ItemRepository;
import com.example.mmg.repository.ItemStatusHistoryRepository;
import com.example.mmg.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminDeleteService {

    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final ItemStatusHistoryRepository historyRepository;

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        // Items this user was assigned to work on get unassigned, not silently orphaned
        itemRepository.findByAssignedEmployee_Id(userId).forEach(item -> {
            item.setAssignedEmployee(null);
            itemRepository.save(item);
        });

        // Items this user (as an admin) assigned to someone else keep their assignment,
        // just forget who made it — otherwise deleting an admin who ever assigned a task
        // would fail on a foreign key violation
        itemRepository.findByAssignedBy_Id(userId).forEach(item -> {
            item.setAssignedBy(null);
            itemRepository.save(item);
        });

        // Items this user uploaded keep existing, just forget who uploaded them —
        // otherwise deleting a user who uploaded anything would fail on a FK violation
        itemRepository.findByUploadedBy_IdOrderByCreatedAtDesc(userId).forEach(item -> {
            item.setUploadedBy(null);
            itemRepository.save(item);
        });

        // If this user is an admin who owns employees, those employees become unassigned
        // rather than blocking the delete or leaving a dangling reference
        userRepository.findByAssignedAdmin_Id(userId).forEach(employee -> {
            employee.setAssignedAdmin(null);
            userRepository.save(employee);
        });

        userRepository.delete(user);
    }

    @Transactional
    public void deleteItem(Long itemId) {
        if (!itemRepository.existsById(itemId)) {
            throw new IllegalArgumentException("Item not found: " + itemId);
        }
        historyRepository.deleteByItem_Id(itemId);
        itemRepository.deleteById(itemId);
    }
}
