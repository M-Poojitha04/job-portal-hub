package com.jobportal.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "profile_education")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Education {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    private String school;
    private String degree;
    private String year;
}