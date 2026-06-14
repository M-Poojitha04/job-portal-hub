package com.jobportal.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private JobApplication application;

    @Column(name = "interview_date", nullable = false)
    private LocalDateTime interviewDate;

    @Column(name = "meeting_link", nullable = false)
    private String meetingLink;

    @Column(name = "notes")
    private String notes;
}