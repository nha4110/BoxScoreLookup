package com.boxscore.backend.service;

import java.util.Map;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriBuilder;

@Service
public class FootballDataService {

    private static final String API_BASE_URL = "https://api.football-data.org/v4";

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    public FootballDataService(
            RestClient.Builder restClientBuilder,
            ObjectMapper objectMapper,
            @Value("${FOOTBALL_API_KEY:}") String apiKey) {
        this.restClient = restClientBuilder.baseUrl(API_BASE_URL).build();
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
    }

    public ResponseEntity<JsonNode> getCompetitionStandings(String code) {
        return get("/competitions/{code}/standings", Map.of(), code);
    }

    public ResponseEntity<JsonNode> getCompetitionMatches(String code, String dateFrom, String dateTo) {
        Map<String, String> queryParameters = new java.util.LinkedHashMap<>();
        addIfPresent(queryParameters, "dateFrom", dateFrom);
        addIfPresent(queryParameters, "dateTo", dateTo);
        return get("/competitions/{code}/matches", queryParameters, code);
    }

    public ResponseEntity<JsonNode> getMatch(long matchId) {
        return get("/matches/{matchId}", Map.of(), matchId);
    }

    public ResponseEntity<JsonNode> getTeam(long teamId) {
        return get("/teams/{teamId}", Map.of(), teamId);
    }

    public ResponseEntity<JsonNode> getTeamMatches(long teamId) {
        return get("/teams/{teamId}/matches", Map.of(), teamId);
    }

    public ResponseEntity<JsonNode> getTeams(String name) {
        Map<String, String> queryParameters = new java.util.LinkedHashMap<>();
        addIfPresent(queryParameters, "name", name);
        return get("/teams", queryParameters);
    }

    private ResponseEntity<JsonNode> get(String path, Map<String, String> queryParameters, Object... uriVariables) {
        if (apiKey.isBlank()) {
            throw new IllegalStateException("FOOTBALL_API_KEY must be configured to call Football-Data.org.");
        }

        return restClient.get()
                .uri(uriBuilder -> buildUri(uriBuilder, path, queryParameters, uriVariables))
                .header("X-Auth-Token", apiKey)
                .exchange((request, response) -> ResponseEntity
                        .status(response.getStatusCode())
                        .body(objectMapper.readTree(response.getBody())));
    }

    private java.net.URI buildUri(
            UriBuilder uriBuilder,
            String path,
            Map<String, String> queryParameters,
            Object... uriVariables) {
        UriBuilder requestUri = uriBuilder.path(path);
        queryParameters.forEach(requestUri::queryParam);
        return requestUri.build(uriVariables);
    }

    private void addIfPresent(Map<String, String> queryParameters, String name, String value) {
        if (value != null && !value.isBlank()) {
            queryParameters.put(name, value);
        }
    }
}
