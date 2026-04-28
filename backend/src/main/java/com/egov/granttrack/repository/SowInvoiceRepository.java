package com.egov.granttrack.repository;

import com.egov.granttrack.entity.SowInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface SowInvoiceRepository extends JpaRepository<SowInvoice, UUID> {

    List<SowInvoice> findBySowId(UUID sowId);

    List<SowInvoice> findBySowIdAndStatus(UUID sowId, String status);

    List<SowInvoice> findByDueDateBetweenAndStatus(LocalDate from, LocalDate to, String status);
}
