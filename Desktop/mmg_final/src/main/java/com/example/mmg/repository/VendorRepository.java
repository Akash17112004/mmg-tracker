package com.example.mmg.repository;

import com.example.mmg.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VendorRepository extends JpaRepository<Vendor, Integer> {
    java.util.Optional<Vendor> findFirstByNameIgnoreCase(String name);
}
