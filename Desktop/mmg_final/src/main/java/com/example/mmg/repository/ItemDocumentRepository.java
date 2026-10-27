package com.example.mmg.repository;

import com.example.mmg.entity.ItemDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ItemDocumentRepository extends JpaRepository<ItemDocument, Long> {
    List<ItemDocument> findByItem_IdOrderByCreatedAtDesc(Long itemId);
    Optional<ItemDocument> findByIdAndItem_Id(Long id, Long itemId);
    long countByItem_Id(Long itemId);
}
