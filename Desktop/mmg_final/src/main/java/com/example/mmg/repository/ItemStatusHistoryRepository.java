package com.example.mmg.repository;

import com.example.mmg.entity.ItemStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ItemStatusHistoryRepository extends JpaRepository<ItemStatusHistory, Long> {
    void deleteByItem_Id(Long itemId);
    List<ItemStatusHistory> findByItem_IdOrderByChangedAtAsc(Long itemId);
    List<ItemStatusHistory> findTop20ByOrderByChangedAtDesc();
    List<ItemStatusHistory> findTop20ByItem_AssignedEmployee_IdOrderByChangedAtDesc(Long employeeId);

    // Explicit LEFT JOIN (not dot-path navigation) so items whose employee has no admin
    // yet aren't silently excluded by an implicit inner join
    @Query("SELECT h FROM ItemStatusHistory h " +
           "JOIN h.item i LEFT JOIN i.assignedEmployee ae LEFT JOIN ae.assignedAdmin aa " +
           "WHERE ae IS NOT NULL AND aa.id = :adminId " +
           "ORDER BY h.changedAt DESC")
    List<ItemStatusHistory> findTop20ScopedToAdmin(@Param("adminId") Long adminId);
}
