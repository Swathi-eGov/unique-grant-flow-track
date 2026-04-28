package com.egov.granttrack.repository;

import com.egov.granttrack.entity.Sow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SowRepository extends JpaRepository<Sow, UUID> {

    List<Sow> findByGrantId(UUID grantId);

    List<Sow> findByMsaId(UUID msaId);

    List<Sow> findByStatus(String status);

    List<Sow> findByArchived(boolean archived);

    Optional<Sow> findBySowNumber(String sowNumber);
}
