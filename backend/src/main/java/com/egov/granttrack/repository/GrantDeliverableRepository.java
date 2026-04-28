package com.egov.granttrack.repository;

import com.egov.granttrack.entity.GrantDeliverable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GrantDeliverableRepository extends JpaRepository<GrantDeliverable, UUID> {

    List<GrantDeliverable> findByGrantId(UUID grantId);

    List<GrantDeliverable> findByGrantIdAndStatus(UUID grantId, String status);
}
