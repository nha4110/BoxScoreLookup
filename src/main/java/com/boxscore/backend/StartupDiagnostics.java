package com.boxscore.backend;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.core.env.Environment;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class StartupDiagnostics implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(StartupDiagnostics.class);

    private final Environment environment;

    public StartupDiagnostics(Environment environment) {
        this.environment = environment;
    }

    @Override
    public void run(ApplicationArguments args) {
        log.info("STARTUP_STAGE=environment_loaded");
        log.info("=== STARTUP DIAGNOSTICS ===");
        log.info("PORT={}", environment.getProperty("PORT", environment.getProperty("server.port", "8080")));
        log.info("ACTIVE_PROFILES={}", String.join(",", environment.getActiveProfiles()));
        log.info("FOOTBALL_API_KEY_EXISTS={}", valueExists(environment.getProperty("FOOTBALL_API_KEY")));
        log.info("BACKEND_SECRET_EXISTS={}", valueExists(environment.getProperty("BACKEND_SECRET")));
        log.info("DATABASE_URL_EXISTS={}", valueExists(environment.getProperty("DATABASE_URL")));
        log.info("SPRING_DATASOURCE_URL_EXISTS={}", valueExists(environment.getProperty("SPRING_DATASOURCE_URL")));
        log.info("===========================");
        log.info("DATABASE_CONFIGURATION=disabled; this application does not use PostgreSQL");
    }

    @EventListener
    public void onApplicationReady(ApplicationReadyEvent event) {
        log.info("STARTUP_STAGE=application_ready");
    }

    private static boolean valueExists(String value) {
        return value != null && !value.isBlank();
    }
}
