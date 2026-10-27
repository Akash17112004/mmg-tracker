package com.example.mmg.repository;
import com.example.mmg.entity.StoreUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface StoreUnitRepository extends JpaRepository<StoreUnit, Long> {
    List<StoreUnit> findByActiveTrueOrderByNameAsc();
}
