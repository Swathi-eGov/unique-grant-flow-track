package com.egov.granttrack.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(basePackages = "com.egov.granttrack.repository")
public class JpaConfig {
    // Datasource and EntityManagerFactory are auto-configured by Spring Boot.
    // This class exists to explicitly enable transaction management and
    // repository scanning with a named base package.
}
