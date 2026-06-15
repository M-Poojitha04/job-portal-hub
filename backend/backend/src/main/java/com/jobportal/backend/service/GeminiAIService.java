package com.jobportal.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobportal.backend.dto.ParsedResumeResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiAIService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper()
            .configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    // 1. AI RESUME PARSER ENGINE
    public ParsedResumeResponse parseRawResumeText(String rawText) {
        String promptInstruction = "You are an expert system Applicant Tracking System (ATS) document data extraction microservice. "
                + "Analyze the raw unstructured resume text string provided below and extract the structural variables. "
                + "You must return your output strictly matching the following JSON schema specification using all lowercase keys with zero markdown decoration wrappers or backticks:\n"
                + "{\n"
                + "  \"skills\": [\"Skill1\", \"Skill2\"],\n"
                + "  \"education\": [{\"institution\": \"Name\", \"degree\": \"Degree\", \"fieldOfStudy\": \"Field\", \"graduationYear\": \"YYYY\"}],\n"
                + "  \"experience\": [{\"company\": \"Name\", \"role\": \"Title\", \"duration\": \"Months/Years\", \"summary\": \"Details\"}]\n"
                + "}\n\n"
                + "Raw Resume Input Text String:\n" + rawText;

        try {
            String rawJsonResult = callGeminiEndpoint(promptInstruction);
            return objectMapper.readValue(rawJsonResult, ParsedResumeResponse.class);
        } catch (Exception e) {
            System.err.println("Gemini Engine parsing breakdown matrix: " + e.getMessage());
            return new ParsedResumeResponse();
        }
    }

    // 2. ATS AUTOMATED ALIGNMENT MATCH SCORE GENERATOR
    public Map<String, Object> computeAtsMatchScore(String candidateProfileJson, String jobDescriptionText) {
        String promptInstruction = "You are a corporate executive talent acquisition manager algorithms suite. "
                + "Compare the Candidate Profile JSON structure against the Job Description specifications text below. "
                + "Compute an explicit matching alignment percentage integer value between 0 and 100. "
                + "Provide 3 short, constructive bullet points detailing critical missing skills or professional optimization feedback recommendations.\n"
                + "You must return your output strictly matching the following JSON schema specification with zero markdown decorations or backticks:\n"
                + "{\n"
                + "  \"matchPercentage\": 85,\n"
                + "  \"feedbackPoints\": [\"Point 1\", \"Point 2\", \"Point 3\"]\n"
                + "}\n\n"
                + "Candidate Profile Data Sheet:\n" + candidateProfileJson + "\n\n"
                + "Target Job Description Parameters:\n" + jobDescriptionText;

        try {
            String rawJsonResult = callGeminiEndpoint(promptInstruction);
            return objectMapper.readValue(rawJsonResult, HashMap.class);
        } catch (Exception e) {
            return Map.of("matchPercentage", 0, "feedbackPoints", List.of("Failed to calculate alignment scoring telemetry variables dynamically."));
        }
    }

    // Underlying low-level HTTP request marshaller loop handler
    private String callGeminiEndpoint(String targetedPrompt) throws Exception {
        // ROBUST FIX: Using the high-quota free-tier gemini-2.5-flash on port 8080
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Standardized structural request mapping payload loop
        Map<String, Object> textMap = Map.of("text", targetedPrompt);
        Map<String, Object> partsMap = Map.of("parts", List.of(textMap));
        Map<String, Object> contentsMap = Map.of("contents", List.of(partsMap));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(contentsMap, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List candidates = (List) response.getBody().get("candidates");
                Map firstCandidate = (Map) candidates.get(0);
                Map content = (Map) firstCandidate.get("content");
                List parts = (List) content.get("parts");
                Map firstPart = (Map) parts.get(0);

                String rawTextOutput = (String) firstPart.get("text");

                if (rawTextOutput.contains("```")) {
                    rawTextOutput = rawTextOutput.replaceAll("```json|```", "").trim();
                } else {
                    rawTextOutput = rawTextOutput.trim();
                }

                System.out.println("Cleaned AI JSON Payload String: " + rawTextOutput);
                return rawTextOutput;
            }
        } catch (org.springframework.web.client.HttpClientErrorException ex) {
            System.err.println("Direct API Response Error Body: " + ex.getResponseBodyAsString());
            throw ex;
        }

        throw new RuntimeException("API response loop failed validation controls checking parameters.");
    }
}