package com.egov.granttrack.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "msas")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
public class Msa {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(name = "vendor_name", nullable = false, length = 255)
    private String vendorName;

    @Column(name = "msa_number", length = 100)
    private String msaNumber;

    @Column(name = "vendor_address", columnDefinition = "TEXT")
    private String vendorAddress;

    @Column(name = "vendor_contact_name", length = 255)
    private String vendorContactName;

    @Column(name = "vendor_contact_email", length = 255)
    private String vendorContactEmail;

    @Column(name = "our_contact_name", length = 255)
    private String ourContactName;

    @Column(name = "our_contact_email", length = 255)
    private String ourContactEmail;

    @Column(name = "effective_date")
    private LocalDate effectiveDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "initial_term_years", precision = 5, scale = 2)
    private BigDecimal initialTermYears;

    @Column(nullable = false, length = 50)
    private String status = "active";

    @Column(name = "governing_law", length = 255)
    private String governingLaw;

    @Column(name = "auto_renew", nullable = false)
    private Boolean autoRenew = false;

    @Column(name = "notice_period", length = 100)
    private String noticePeriod;

    @Column(name = "liability_cap", length = 255)
    private String liabilityCap;

    @Column(name = "ip_ownership", columnDefinition = "TEXT")
    private String ipOwnership;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "key_terms", columnDefinition = "TEXT")
    private String keyTerms;

    @Column(name = "pdf_url", columnDefinition = "TEXT")
    private String pdfUrl;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false)
    private Boolean archived = false;

    @Column(name = "created_at", nullable = false, updatable = false,
            columnDefinition = "TIMESTAMPTZ DEFAULT NOW()")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false,
            columnDefinition = "TIMESTAMPTZ DEFAULT NOW()")
    private OffsetDateTime updatedAt;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    @PrePersist
    void prePersist() {
        OffsetDateTime now = OffsetDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public void softDelete() {
        this.deletedAt = OffsetDateTime.now();
    }
}
