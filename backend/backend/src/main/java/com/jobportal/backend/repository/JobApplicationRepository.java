package com.jobportal.backend.repository;

import com.jobportal.backend.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    // Check if duplicate application exists
    boolean existsByJobIdAndCandidateId(Long jobId, Long candidateId);

    // For Candidate tracking dashboards
    List<JobApplication> findByCandidateIdOrderByAppliedAtDesc(Long candidateId);

    // For Recruiter review screens
    List<JobApplication> findByJobIdOrderByAppliedAtDesc(Long jobId);
}