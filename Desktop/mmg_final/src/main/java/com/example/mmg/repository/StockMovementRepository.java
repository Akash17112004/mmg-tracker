package com.example.mmg.repository;

import com.example.mmg.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    List<StockMovement> findByStockItem_IdOrderByChangedAtDesc(Long stockItemId);
}
