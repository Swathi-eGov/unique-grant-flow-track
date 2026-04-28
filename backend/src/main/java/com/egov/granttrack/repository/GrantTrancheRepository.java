package com.egov.granttrack.repository;

import com.egov.granttrack.entity.GrantTranche;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface GrantTrancheRepository extends JpaRepository<GrantTranche, UUID> {

    List<GrantTranche> findByGrantId(UUID grantId);

    List<GrantTranche> findByGrantIdAndStatus(UUID grantId, String status);

    /** Tranches whose invoice trigger date is on or before the given date (for alerts). */
    List<GrantTranche> findByInvoiceTriggerDateLessThanEqualAndStatus(
            LocalDate triggerDate, String status);
}
