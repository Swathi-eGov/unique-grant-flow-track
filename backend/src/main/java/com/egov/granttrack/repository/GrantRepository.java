package com.egov.granttrack.repository;

import com.egov.granttrack.entity.Grant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GrantRepository extends JpaRepository<Grant, UUID> {

    List<Grant> findByStatus(String status);

    List<Grant> findByArchived(boolean archived);

    List<Grant> findByStatusAndArchived(String status, boolean archived);

    Optional<Grant> findByGrantNumber(String grantNumber);

    /** All non-deleted grants ordered by end_date ascending (for dashboard alerts). */
    @Query("SELECT g FROM Grant g WHERE g.deletedAt IS NULL ORDER BY g.endDate ASC NULLS LAST")
    List<Grant> findAllActiveOrderByEndDate();
}
