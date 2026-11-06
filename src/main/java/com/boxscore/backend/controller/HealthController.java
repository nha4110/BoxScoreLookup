package com.boxscore.backend.controller;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

import com.boxscore.backend.service.FootballDataService;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.HttpStatus;
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
                        () -> new CheckResult("/api/football/competitions/PL/standings",
                                footballDataService.getCompetitionStandings("PL"))),
                new ApiCheck("/api/football/competitions/PL/matches",
                        () -> new CheckResult("/api/football/competitions/PL/matches",
                                footballDataService.getCompetitionMatches("PL", null, null))),
                new ApiCheck("/api/football/matches/{matchId}", this::checkSampleMatch),
                new ApiCheck("/api/football/teams/57",
                        () -> new CheckResult("/api/football/teams/57", footballDataService.getTeam(57))),
                new ApiCheck("/api/football/teams/57/matches",
                        () -> new CheckResult("/api/football/teams/57/matches",
                                footballDataService.getTeamMatches(57))),
                new ApiCheck("/api/football/teams?name=Arsenal",
                        () -> new CheckResult("/api/football/teams?name=Arsenal",
                                footballDataService.getTeams("Arsenal"))));

        List<String> failingEndpoints = new ArrayList<>();
        for (ApiCheck check : checks) {
            String endpoint = check.endpoint();
            try {
                CheckResult checkResult = check.request().get();
                endpoint = checkResult.endpoint();
                ResponseEntity<JsonNode> response = checkResult.response();
                if (response == null) {
                    failingEndpoints.add(endpoint + ": No response received");
                } else if (!response.getStatusCode().equals(HttpStatus.OK)) {
                    failingEndpoints.add(endpoint + ": HTTP " + response.getStatusCode().value());
                }
            } catch (Exception exception) {
                String message = exception.getMessage();
                if (message == null || message.isBlank()) {
                    message = exception.getClass().getSimpleName();
                }
                failingEndpoints.add(endpoint + ": " + message.replaceAll("[\\r\\n]+", " ").strip());
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

    private CheckResult checkSampleMatch() {
        ResponseEntity<JsonNode> matchesResponse =
                footballDataService.getCompetitionMatches("PL", null, null);
        String fallbackEndpoint = "/api/football/matches/{matchId}";
        if (matchesResponse == null || !matchesResponse.getStatusCode().equals(HttpStatus.OK)) {
            return new CheckResult(fallbackEndpoint, matchesResponse);
        }

        JsonNode matches = matchesResponse.getBody() == null
                ? null
                : matchesResponse.getBody().path("matches");
        if (matches == null || !matches.isArray()) {
            throw new IllegalStateException("Could not resolve a sample match ID from the PL matches response.");
        }

        for (JsonNode match : matches) {
            JsonNode matchIdNode = match.path("id");
            if (matchIdNode.isIntegralNumber() && matchIdNode.canConvertToLong()) {
                long matchId = matchIdNode.longValue();
                if (matchId > 0) {
                    String endpoint = "/api/football/matches/" + matchId;
                    return new CheckResult(endpoint, footballDataService.getMatch(matchId));
                }
            }
        }

        throw new IllegalStateException("Could not resolve a sample match ID from the PL matches response.");
    }

    private record ApiCheck(String endpoint, Supplier<CheckResult> request) {
    }

    private record CheckResult(String endpoint, ResponseEntity<JsonNode> response) {
    }
}
