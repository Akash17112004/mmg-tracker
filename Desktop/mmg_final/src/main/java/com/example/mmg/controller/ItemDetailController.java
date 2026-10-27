package com.example.mmg.controller;

import com.example.mmg.dto.ItemDetailDto;
import com.example.mmg.dto.ItemHistoryDto;
import com.example.mmg.entity.Item;
import com.example.mmg.entity.User;
import com.example.mmg.repository.ItemRepository;
import com.example.mmg.repository.ItemStatusHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemDetailController {

    private final ItemRepository itemRepository;
    private final ItemStatusHistoryRepository historyRepository;

    @GetMapping("/{itemId}")
    public ResponseEntity<ItemDetailDto> getDetail(@PathVariable Long itemId, @AuthenticationPrincipal User currentUser) {
        Item item = checkAccess(itemId, currentUser);
        return ResponseEntity.ok(ItemDetailDto.fromEntity(item));
    }

    @GetMapping("/{itemId}/history")
    public ResponseEntity<List<ItemHistoryDto>> getHistory(@PathVariable Long itemId, @AuthenticationPrincipal User currentUser) {
        checkAccess(itemId, currentUser);
        List<ItemHistoryDto> history = historyRepository.findByItem_IdOrderByChangedAtAsc(itemId).stream()
                .map(ItemHistoryDto::fromEntity)
                .toList();
        return ResponseEntity.ok(history);
    }

    private Item checkAccess(Long itemId, User currentUser) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + itemId));

        String roleName = currentUser.getRole().getName();
        boolean isSuperAdmin = (roleName.equalsIgnoreCase("JS_ADMIN") || roleName.equalsIgnoreCase("DIRECTOR_ADMIN"));
        boolean isAdmin = roleName.equalsIgnoreCase("ADMIN");
        boolean isAssignedEmployee = item.getAssignedEmployee() != null
                && item.getAssignedEmployee().getId().equals(currentUser.getId());

        boolean adminOwnsItem = isAdmin && (
                item.getAssignedEmployee() == null
                || (item.getAssignedEmployee().getAssignedAdmin() != null
                    && item.getAssignedEmployee().getAssignedAdmin().getId().equals(currentUser.getId()))
        );

        if (!isSuperAdmin && !adminOwnsItem && !isAssignedEmployee) {
            throw new SecurityException("You do not have access to this item");
        }
        return item;
    }
}
