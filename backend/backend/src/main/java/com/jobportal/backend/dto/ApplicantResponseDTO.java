package com.jobportal.backend.dto;

import com.jobportal.backend.model.ApplicationStatus;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicantResponseDTO {
    private Long applicationId;
    private ApplicationStatus status;
    private LocalDateTime appliedAt;

    // Flattened profile data fields
    private String firstName;
    private String lastName;
    private String headline;
    private String phone;
    private String resumeUrl;
    private String email;
}