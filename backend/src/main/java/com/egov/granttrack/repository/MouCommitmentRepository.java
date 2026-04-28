package com.egov.granttrack.repository;

import com.egov.granttrack.entity.MouCommitment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MouCommitmentRepository extends JpaRepository<MouCommitment, UUID> {

    List<MouCommitment> findByMouId(UUID mouId);

    List<MouCommitment> findByMouIdAndStatus(UUID mouId, String status);
}
