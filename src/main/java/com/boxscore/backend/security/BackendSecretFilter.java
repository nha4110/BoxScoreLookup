package com.boxscore.backend.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

import jakarta.annotation.PostConstruct;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class BackendSecretFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(BackendSecretFilter.class);

    private static final String FOOTBALL_API_PATH = "/api/football";
    private static final String SECRET_HEADER = "X-Backend-Secret";
    private final String backendSecret;

    public BackendSecretFilter(@Value("${BACKEND_SECRET:}") String backendSecret) {
        if (backendSecret == null || backendSecret.isBlank()) {
            throw new IllegalStateException(
                    "BACKEND_SECRET is not configured.\n"
                            + "Refusing to start for security reasons.");
        }
        this.backendSecret = backendSecret;
    }

    @PostConstruct
    private void logSecretConfiguration() {
        log.info("STARTUP_STAGE=secret_validation configured=true");
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return !path.equals(FOOTBALL_API_PATH) && !path.startsWith(FOOTBALL_API_PATH + "/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String providedSecret = request.getHeader(SECRET_HEADER);
        if (providedSecret == null || !MessageDigest.isEqual(
                backendSecret.getBytes(StandardCharsets.UTF_8),
                providedSecret.getBytes(StandardCharsets.UTF_8))) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        filterChain.doFilter(request, response);
    }
}
