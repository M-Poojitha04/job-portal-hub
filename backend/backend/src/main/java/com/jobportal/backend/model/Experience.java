package com.jobportal.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "profile_experience")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Experience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    private String company;
    private String role;
    private String duration;
}