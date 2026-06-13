package com.jobportal.backend.dto;

import com.jobportal.backend.model.JobType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class JobRequest {
    @NotBlank(message = "Job title is required")
    private String title;

    @NotBlank(message = "Job description is required")
    private String description;

    @NotBlank(message = "Company name is required")
    private String companyName;

    @NotBlank(message = "Location is required")
    private String location;

    private String salaryRange;

    @Min(value = 0, message = "Experience cannot be negative")
    private Integer experienceRequired;

    @NotNull(message = "Job type is required")
    private JobType jobType;
}