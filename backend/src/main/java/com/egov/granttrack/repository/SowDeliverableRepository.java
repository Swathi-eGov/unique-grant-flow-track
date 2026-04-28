package com.egov.granttrack.repository;

import com.egov.granttrack.entity.SowDeliverable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SowDeliverableRepository extends JpaRepository<SowDeliverable, UUID> {

    List<SowDeliverable> findBySowId(UUID sowId);

    List<SowDeliverable> findBySowIdAndStatus(UUID sowId, String status);
}
