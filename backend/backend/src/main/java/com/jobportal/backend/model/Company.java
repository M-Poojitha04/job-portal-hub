package com.jobportal.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "logo_url")
    private String logoUrl;

    private String website;

    @Column(name = "social_links")
    private String socialLinks;

    @Column(name = "is_verified", nullable = false)
    @Builder.Default
    private boolean isVerified = false; // Admin Verification State Flag: Requires explicit admin sign-off
}