package com.egov.granttrack.repository;

import com.egov.granttrack.entity.MsaKeyClause;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MsaKeyClauseRepository extends JpaRepository<MsaKeyClause, UUID> {

    List<MsaKeyClause> findByMsaId(UUID msaId);
}
