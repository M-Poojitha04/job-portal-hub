package com.jobportal.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class ParsedResumeResponse {
    private List<String> skills;
    private List<EducationDTO> education;
    private List<ExperienceDTO> experience;

    @Data
    public static class EducationDTO {
        private String institution;
        private String degree;
        private String fieldOfStudy;
        private String graduationYear;
    }

    @Data
    public static class ExperienceDTO {
        private String company;
        private String role;
        private String duration;
        private String summary;
    }
}