package com.example.mmg.repository;
import com.example.mmg.entity.StoreItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface StoreItemRepository extends JpaRepository<StoreItem, Long> {
    List<StoreItem> findByActiveTrueOrderByCategory_NameAscNameAsc();
    List<StoreItem> findByNameContainingIgnoreCaseOrCategory_NameContainingIgnoreCase(String name, String category);
}
