package com.egov.granttrack.repository;

import com.egov.granttrack.entity.Msa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MsaRepository extends JpaRepository<Msa, UUID> {

    List<Msa> findByStatus(String status);

    List<Msa> findByArchived(boolean archived);

    Optional<Msa> findByMsaNumber(String msaNumber);
}
