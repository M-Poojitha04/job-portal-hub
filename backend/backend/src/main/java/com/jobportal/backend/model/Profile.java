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
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Let MySQL assign profile IDs cleanly
    private Long id;

    @OneToOne(fetch = FetchType.LAZY) // or @ManyToOne depending on your exact Profile.java code
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore // Stops Jackson from trying to serialize the lazy-loaded user proxy
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