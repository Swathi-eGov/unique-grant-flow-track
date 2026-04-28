package com.egov.granttrack.repository;

import com.egov.granttrack.entity.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, UUID> {

    List<Milestone> findByGrantId(UUID grantId);

    List<Milestone> findByGrantIdAndStatus(UUID grantId, String status);

    List<Milestone> findByDueDateBetweenAndStatus(LocalDate from, LocalDate to, String status);
}
