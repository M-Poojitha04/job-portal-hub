package com.jobportal.backend.controller;

import com.jobportal.backend.dto.ParsedResumeResponse;
import com.jobportal.backend.service.GeminiAIService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
public class AIClusterController {

    private final GeminiAIService aiService;

    public AIClusterController(GeminiAIService aiService) {
        this.aiService = aiService;
    }

    // Endpoint mapping allowing candidates to process raw text parsing runs directly
    @PostMapping("/parse-resume")
    public ResponseEntity<ParsedResumeResponse> processResumeParsing(@RequestBody Map<String, String> request) {
        String rawText = request.get("resumeText");
        if (rawText == null || rawText.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ParsedResumeResponse());
        }
        return ResponseEntity.ok(aiService.parseRawResumeText(rawText));
    }
}