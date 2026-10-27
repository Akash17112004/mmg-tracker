package com.example.mmg.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "store_ledger_entries")
@Getter @Setter @NoArgsConstructor
public class StoreLedgerEntry {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate entryDate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "store_item_id", nullable = false)
    private StoreItem storeItem;

    @Column(name = "vendor_name", length = 200)
    private String vendorName;

    @Column(name = "user_unit_name", length = 200)
    private String userUnitName;

    @Column(name = "voucher_no", length = 100)
    private String voucherNo;

    @Column(name = "unit_price", precision = 14, scale = 2, nullable = false)
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @Column(nullable = false)
    private Integer receipt = 0;

    @Column(nullable = false)
    private Integer issue = 0;

    @Column(name = "balance_qty", nullable = false)
    private Integer balanceQty = 0;

    @Column(name = "balance_value", precision = 16, scale = 2, nullable = false)
    private BigDecimal balanceValue = BigDecimal.ZERO;

    @Column(length = 500)
    private String remarks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private User createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); }
}
