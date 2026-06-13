package com.jobportal.backend.repository;

import com.jobportal.backend.model.Job;
import com.jobportal.backend.model.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    // Find all active job posts for the candidate home feeds
    List<Job> findByStatusOrderByCreatedAtDesc(JobStatus status);

    // Find all posts managed by a specific recruiter account
    List<Job> findByRecruiterIdOrderByCreatedAtDesc(Long recruiterId);
}