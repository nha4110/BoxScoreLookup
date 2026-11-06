package com.boxscore.backend.controller;

import com.boxscore.backend.service.FootballDataService;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/football")
public class FootballController {

    private final FootballDataService footballDataService;

    public FootballController(FootballDataService footballDataService) {
        this.footballDataService = footballDataService;
    }

    @GetMapping("/competitions/{code}/standings")
    public ResponseEntity<JsonNode> getCompetitionStandings(@PathVariable String code) {
        return footballDataService.getCompetitionStandings(code);
    }

    @GetMapping("/competitions/{code}/matches")
    public ResponseEntity<JsonNode> getCompetitionMatches(
            @PathVariable String code,
            @RequestParam(name = "dateFrom", required = false) String dateFrom,
            @RequestParam(name = "dateTo", required = false) String dateTo) {
        return footballDataService.getCompetitionMatches(code, dateFrom, dateTo);
    }

    @GetMapping("/matches/{matchId}")
    public ResponseEntity<JsonNode> getMatch(@PathVariable long matchId) {
        return footballDataService.getMatch(matchId);
    }

    @GetMapping("/teams/{teamId}")
    public ResponseEntity<JsonNode> getTeam(@PathVariable long teamId) {
        return footballDataService.getTeam(teamId);
    }

    @GetMapping("/teams/{teamId}/matches")
    public ResponseEntity<JsonNode> getTeamMatches(@PathVariable long teamId) {
        return footballDataService.getTeamMatches(teamId);
    }

    @GetMapping("/teams")
    public ResponseEntity<JsonNode> getTeams(
            @RequestParam(name = "name", required = false) String name) {
        return footballDataService.getTeams(name);
    }
}
