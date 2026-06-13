package com.jobportal.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Profile {

    @Id
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId // Shares the primary key with the User entity
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    private String phone;

    private String headline; // e.g., "Software Engineer Intern"

    @Column(name = "profile_pic_url")
    private String profilePicUrl;

    @Column(name = "resume_url")
    private String resumeUrl;
}