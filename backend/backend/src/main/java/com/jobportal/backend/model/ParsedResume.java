package com.jobportal.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "parsed_resumes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParsedResume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    @JsonIgnore // <-- THIS BREAKS THE INFINITE JSON SERIALIZATION LOOP INSTANTLY!
    private User user;

    private String candidateName;
    private String candidateEmail;

    @ElementCollection
    @CollectionTable(name = "resume_skills", joinColumns = @JoinColumn(name = "resume_id"))
    @Column(name = "skill")
    private List<String> skills;

    @Column(columnDefinition = "TEXT")
    private String highestEducation;

    @Column(columnDefinition = "TEXT")
    private String latestExperience;

    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        this.uploadedAt = LocalDateTime.now();
    }
}