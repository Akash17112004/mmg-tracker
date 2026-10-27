package com.example.mmg.service;

import com.example.mmg.dto.DashboardSummaryDto;
import com.example.mmg.dto.ItemDashboardDto;
import com.example.mmg.dto.PagedItemsDto;
import com.example.mmg.entity.ItemStatus;
import com.example.mmg.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ItemRepository itemRepository;

    // ownerAdminId is null for JS_ADMIN (unrestricted) or the calling admin's id otherwise
    public DashboardSummaryDto getSummary(Long ownerAdminId) {
        long uploaded = itemRepository.countByStatusScoped(ItemStatus.UPLOADED, ownerAdminId);
        long assigned = itemRepository.countByStatusScoped(ItemStatus.ASSIGNED, ownerAdminId);
        long pending = itemRepository.countByStatusScoped(ItemStatus.PENDING, ownerAdminId);
        long inProgress = itemRepository.countByStatusScoped(ItemStatus.IN_PROGRESS, ownerAdminId);
        long completed = itemRepository.countByStatusScoped(ItemStatus.COMPLETED, ownerAdminId);
        long total = uploaded + assigned + pending + inProgress + completed;

        return new DashboardSummaryDto(uploaded, assigned, pending, inProgress, completed, total);
    }

    public List<ItemDashboardDto> getAllItems(Long ownerAdminId) {
        return itemRepository.searchByNameScoped(null, ownerAdminId).stream()
                .map(ItemDashboardDto::fromEntity)
                .toList();
    }

    public List<ItemDashboardDto> searchItems(String query, Long ownerAdminId) {
        return itemRepository.searchByNameScoped(query, ownerAdminId).stream()
                .map(ItemDashboardDto::fromEntity)
                .toList();
    }

    public PagedItemsDto getFilteredItems(String statusRaw, int page, int size, Long ownerAdminId) {
        ItemStatus status = null;
        if (statusRaw != null && !statusRaw.isBlank()) {
            status = ItemStatus.valueOf(statusRaw.toUpperCase());
        }

        Page<com.example.mmg.entity.Item> result =
                itemRepository.findFilteredScoped(status, ownerAdminId, PageRequest.of(page, size));

        List<ItemDashboardDto> dtos = result.getContent().stream()
                .map(ItemDashboardDto::fromEntity)
                .toList();

        return new PagedItemsDto(dtos, page, result.getTotalPages(), result.getTotalElements());
    }

    public DashboardSummaryDto getEmployeeSummary(Long employeeId) {
        long assigned = itemRepository.countByAssignedEmployee_IdAndStatus(employeeId, ItemStatus.ASSIGNED);
        long pending = itemRepository.countByAssignedEmployee_IdAndStatus(employeeId, ItemStatus.PENDING);
        long inProgress = itemRepository.countByAssignedEmployee_IdAndStatus(employeeId, ItemStatus.IN_PROGRESS);
        long completed = itemRepository.countByAssignedEmployee_IdAndStatus(employeeId, ItemStatus.COMPLETED);
        long total = assigned + pending + inProgress + completed;

        return new DashboardSummaryDto(0, assigned, pending, inProgress, completed, total);
    }

    public List<ItemDashboardDto> getEmployeeItems(Long employeeId) {
        return itemRepository.findByAssignedEmployee_Id(employeeId).stream()
                .map(ItemDashboardDto::fromEntity)
                .toList();
    }
}
