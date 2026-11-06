package com.boxscore.backend.controller;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

import com.boxscore.backend.service.FootballDataService;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    private final FootballDataService footballDataService;

    public HealthController(FootballDataService footballDataService) {
        this.footballDataService = footballDataService;
    }

    @GetMapping("/api/health")
    public Map<String, Object> health() {
        List<ApiCheck> checks = List.of(
                new ApiCheck("/api/football/competitions/PL/standings",
                        () -> footballDataService.getCompetitionStandings("PL")),
                new ApiCheck("/api/football/competitions/PL/matches",
                        () -> footballDataService.getCompetitionMatches("PL", null, null)),
                new ApiCheck("/api/football/matches/2021",
                        () -> footballDataService.getMatch(2021)),
                new ApiCheck("/api/football/teams/57",
                        () -> footballDataService.getTeam(57)),
                new ApiCheck("/api/football/teams/57/matches",
                        () -> footballDataService.getTeamMatches(57)),
                new ApiCheck("/api/football/teams?name=Arsenal",
                        () -> footballDataService.getTeams("Arsenal")));

        List<String> failingEndpoints = new ArrayList<>();
        for (ApiCheck check : checks) {
            try {
                ResponseEntity<JsonNode> response = check.request().get();
                if (response == null) {
                    failingEndpoints.add(check.endpoint() + ": No response received");
                } else if (response.getStatusCode().value() != 200) {
                    failingEndpoints.add(check.endpoint() + ": HTTP " + response.getStatusCode().value());
                }
            } catch (Exception exception) {
                String message = exception.getMessage();
                if (message == null || message.isBlank()) {
                    message = exception.getClass().getSimpleName();
                }
                failingEndpoints.add(check.endpoint() + ": " + message.replaceAll("[\\r\\n]+", " ").strip());
            }
        }

        int failingCount = failingEndpoints.size();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", failingCount == 0 ? "UP" : "DEGRADED");
        result.put("totalApisChecked", checks.size());
        result.put("workingApisCount", checks.size() - failingCount);
        result.put("failingApisCount", failingCount);
        if (failingCount > 0) {
            result.put("failingEndpoints", failingEndpoints);
        }
        return result;
    }

    private record ApiCheck(String endpoint, Supplier<ResponseEntity<JsonNode>> request) {
    }
}
