package com.egov.granttrack.repository;

import com.egov.granttrack.entity.AppSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppSettingsRepository extends JpaRepository<AppSettings, UUID> {

    /** Returns the singleton settings row. */
    @Query("SELECT s FROM AppSettings s ORDER BY s.createdAt ASC LIMIT 1")
    Optional<AppSettings> findFirst();
}
