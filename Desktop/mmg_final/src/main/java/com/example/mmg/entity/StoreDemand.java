package com.example.mmg.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "store_demands")
@Getter @Setter @NoArgsConstructor
public class StoreDemand {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_item_id")
    private StoreItem storeItem;

    @Column(name = "custom_item_name", length = 200)
    private String customItemName;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "user_unit_name", length = 200)
    private String userUnitName;

    @Column(length = 500)
    private String purpose;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StoreDemandStatus status = StoreDemandStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requested_by_id", nullable = false)
    private User requestedBy;

    @Column(name = "requested_at", updatable = false)
    private LocalDateTime requestedAt;

    @Column(name = "fulfilled_qty", nullable = false)
    private Integer fulfilledQty = 0;

    @Column(length = 500)
    private String storeRemarks;

    @PrePersist protected void onCreate() { requestedAt = LocalDateTime.now(); }

    public String getDisplayItemName() { return storeItem != null ? storeItem.getName() : customItemName; }
}
