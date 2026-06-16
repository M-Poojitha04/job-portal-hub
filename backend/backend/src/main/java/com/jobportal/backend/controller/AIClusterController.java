package com.jobportal.backend.controller;

import com.jobportal.backend.dto.ParsedResumeResponse;
import com.jobportal.backend.model.ParsedResume;
import com.jobportal.backend.repository.ParsedResumeRepository;
import com.jobportal.backend.service.GeminiAIService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // <-- CRITICAL NEW IMPORT
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AIClusterController {

    private final GeminiAIService aiService;
    private final ParsedResumeRepository resumeRepository;

    public AIClusterController(GeminiAIService aiService, ParsedResumeRepository resumeRepository) {
        this.aiService = aiService;
        this.resumeRepository = resumeRepository;
    }

    @PostMapping("/api/v1/ai/parse-resume")
    @PreAuthorize("permitAll()") // <-- FORCE OPEN FOR CANDIDATE PARSER
    public ResponseEntity<ParsedResumeResponse> processResumeParsing(@RequestBody Map<String, String> request) {
        String rawText = request.get("resumeText");
        String email = request.getOrDefault("email", "candidate1@gmail.com");

        if (rawText == null || rawText.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ParsedResumeResponse());
        }

        return ResponseEntity.ok(aiService.parseRawResumeText(rawText, email));
    }

    @GetMapping("/api/v1/ai/recruiter/applicants")
    public ResponseEntity<?> getAllApplicants() {
        System.out.println("🚀 Connected! Fetching data rows safely using flat projection.");
        try {
            return ResponseEntity.ok(resumeRepository.findAllFlatApplicants());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Database query crashed: " + e.getMessage());
        }
    }

    @GetMapping("/api/v1/ai/recruiter/search")
    @PreAuthorize("permitAll()") // <-- FORCE Method Security to step aside here too
    public ResponseEntity<List<ParsedResume>> searchBySkill(@RequestParam String skill) {
        return ResponseEntity.ok(resumeRepository.findBySkillKeyword(skill));
    }
}