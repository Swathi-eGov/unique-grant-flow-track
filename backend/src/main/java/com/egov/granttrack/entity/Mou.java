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
@Table(name = "mous")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
public class Mou {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(name = "partner_name", nullable = false, length = 255)
    private String partnerName;

    @Column(name = "mou_number", length = 100)
    private String mouNumber;

    @Column(name = "partner_type", length = 50)
    private String partnerType;

    @Column(name = "partner_address", columnDefinition = "TEXT")
    private String partnerAddress;

    @Column(name = "partner_contact_name", length = 255)
    private String partnerContactName;

    @Column(name = "partner_contact_email", length = 255)
    private String partnerContactEmail;

    @Column(name = "partner_signatory_name", length = 255)
    private String partnerSignatoryName;

    @Column(name = "partner_signatory_designation", length = 255)
    private String partnerSignatoryDesignation;

    @Column(name = "our_contact_name", length = 255)
    private String ourContactName;

    @Column(name = "our_contact_email", length = 255)
    private String ourContactEmail;

    @Column(name = "our_signatory_name", length = 255)
    private String ourSignatoryName;

    @Column(name = "our_signatory_designation", length = 255)
    private String ourSignatoryDesignation;

    @Column(name = "signed_date")
    private LocalDate signedDate;

    @Column(name = "effective_date")
    private LocalDate effectiveDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "initial_term_years", precision = 5, scale = 2)
    private BigDecimal initialTermYears;

    @Column(name = "review_cycle", length = 50)
    private String reviewCycle;

    @Column(nullable = false, length = 50)
    private String status = "active";

    @Column(columnDefinition = "TEXT")
    private String purpose;

    @Column(name = "scope_of_collaboration", columnDefinition = "TEXT")
    private String scopeOfCollaboration;

    @Column(name = "governing_law", length = 255)
    private String governingLaw;

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
