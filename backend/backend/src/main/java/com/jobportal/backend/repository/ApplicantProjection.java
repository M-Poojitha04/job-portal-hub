package com.jobportal.backend.repository;

public interface ApplicantProjection {
    Long getId();
    String getCandidateName();
    String getCandidateEmail();
    String getHighestEducation();
    String getLatestExperience();
}