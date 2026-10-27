package com.example.mmg.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "store_correction_requests")
@Getter @Setter @NoArgsConstructor
public class StoreCorrectionRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ledger_entry_id", nullable = false)
    private StoreLedgerEntry ledgerEntry;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "raised_by_id", nullable = false)
    private User raisedBy;

    @Column(nullable = false, length = 1000)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StoreCorrectionStatus status = StoreCorrectionStatus.PENDING;

    private Integer correctedReceipt;
    private Integer correctedIssue;
    private BigDecimal correctedUnitPrice;
    private String correctedVendorName;
    private String correctedUserUnitName;
    private String correctedVoucherNo;

    @Column(length = 1000)
    private String oicRemarks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_id")
    private User reviewedBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
    private LocalDateTime appliedAt;

    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); }
}
