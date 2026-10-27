package com.example.mmg.repository;
import com.example.mmg.entity.StoreDemand;
import com.example.mmg.entity.StoreDemandStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface StoreDemandRepository extends JpaRepository<StoreDemand, Long> {
    List<StoreDemand> findAllByOrderByRequestedAtDesc();
    List<StoreDemand> findByStatusOrderByRequestedAtDesc(StoreDemandStatus status);
}
