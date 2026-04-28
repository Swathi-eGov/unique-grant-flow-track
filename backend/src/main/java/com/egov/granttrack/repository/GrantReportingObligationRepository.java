package com.egov.granttrack.repository;

import com.egov.granttrack.entity.GrantReportingObligation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface GrantReportingObligationRepository extends JpaRepository<GrantReportingObligation, UUID> {

    List<GrantReportingObligation> findByGrantId(UUID grantId);

    List<GrantReportingObligation> findByGrantIdAndStatus(UUID grantId, String status);

    List<GrantReportingObligation> findByDueDateBetweenAndStatus(
            LocalDate from, LocalDate to, String status);
}
