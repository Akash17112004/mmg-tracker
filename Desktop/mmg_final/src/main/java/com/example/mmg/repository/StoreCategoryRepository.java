package com.example.mmg.repository;
import com.example.mmg.entity.StoreCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface StoreCategoryRepository extends JpaRepository<StoreCategory, Long> { List<StoreCategory> findByActiveTrueOrderByNameAsc(); }
