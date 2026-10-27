package com.example.mmg.repository;

import com.example.mmg.entity.Item;
import com.example.mmg.entity.ItemStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {

    // IMPORTANT: uses explicit LEFT JOINs, not dot-path navigation (i.assignedEmployee.assignedAdmin.id).
    // Dot-path navigation compiles to an INNER JOIN in JPQL, which silently drops any item whose
    // employee is null OR whose employee has no admin yet — causing dashboards to show zero even
    // though the data exists. LEFT JOIN preserves those rows so the null-checks in WHERE actually work.

    @Query("SELECT COUNT(i) FROM Item i " +
           "LEFT JOIN i.assignedEmployee ae LEFT JOIN ae.assignedAdmin aa " +
           "WHERE i.status = :status " +
           "AND (:ownerAdminId IS NULL OR i.assignedEmployee IS NULL OR aa.id = :ownerAdminId)")
    long countByStatusScoped(@Param("status") ItemStatus status, @Param("ownerAdminId") Long ownerAdminId);

    long countByStatus(ItemStatus status);

    List<Item> findByAssignedEmployee_Id(Long employeeId);

    List<Item> findByAssignedBy_Id(Long adminId);

    List<Item> findByUploadedBy_IdOrderByCreatedAtDesc(Long userId);

    long countByAssignedEmployee_IdAndStatus(Long employeeId, ItemStatus status);

    @Query("SELECT i FROM Item i " +
           "LEFT JOIN i.assignedEmployee ae LEFT JOIN ae.assignedAdmin aa " +
           "WHERE (:query IS NULL OR LOWER(i.itemName) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:ownerAdminId IS NULL OR i.assignedEmployee IS NULL OR aa.id = :ownerAdminId) " +
           "ORDER BY i.createdAt DESC")
    List<Item> searchByNameScoped(@Param("query") String query, @Param("ownerAdminId") Long ownerAdminId);

    @Query("SELECT i FROM Item i " +
           "LEFT JOIN i.assignedEmployee ae LEFT JOIN ae.assignedAdmin aa " +
           "WHERE (:status IS NULL OR i.status = :status) " +
           "AND (:ownerAdminId IS NULL OR i.assignedEmployee IS NULL OR aa.id = :ownerAdminId) " +
           "ORDER BY i.createdAt DESC")
    Page<Item> findFilteredScoped(
            @Param("status") ItemStatus status,
            @Param("ownerAdminId") Long ownerAdminId,
            Pageable pageable
    );
}
