package com.example.mmg.repository;
import com.example.mmg.entity.StoreCorrectionRequest;
import com.example.mmg.entity.StoreCorrectionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface StoreCorrectionRequestRepository extends JpaRepository<StoreCorrectionRequest, Long> {
    List<StoreCorrectionRequest> findAllByOrderByCreatedAtDesc();
    List<StoreCorrectionRequest> findByStatusOrderByCreatedAtDesc(StoreCorrectionStatus status);
}
