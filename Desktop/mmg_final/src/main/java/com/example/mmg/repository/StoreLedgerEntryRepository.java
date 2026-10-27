package com.example.mmg.repository;
import com.example.mmg.entity.StoreLedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface StoreLedgerEntryRepository extends JpaRepository<StoreLedgerEntry, Long> {
    List<StoreLedgerEntry> findByStoreItem_IdOrderByEntryDateAscIdAsc(Long storeItemId);
    List<StoreLedgerEntry> findAllByOrderByEntryDateDescIdDesc();
}
