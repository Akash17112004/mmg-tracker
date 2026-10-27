package com.example.mmg.repository;

import com.example.mmg.entity.StockItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockItemRepository extends JpaRepository<StockItem, Long> {
    List<StockItem> findByNameContainingIgnoreCase(String name);
}
