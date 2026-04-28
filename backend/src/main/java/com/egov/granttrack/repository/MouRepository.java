package com.egov.granttrack.repository;

import com.egov.granttrack.entity.Mou;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MouRepository extends JpaRepository<Mou, UUID> {

    List<Mou> findByStatus(String status);

    List<Mou> findByArchived(boolean archived);

    Optional<Mou> findByMouNumber(String mouNumber);
}
