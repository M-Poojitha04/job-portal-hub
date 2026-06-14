package com.jobportal.backend.repository;

import com.jobportal.backend.model.BookmarkedJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookmarkedJobRepository extends JpaRepository<BookmarkedJob, Long> {
    List<BookmarkedJob> findByUserId(Long userId);
    Optional<BookmarkedJob> findByUserIdAndJobId(Long userId, Long jobId);
    boolean existsByUserIdAndJobId(Long userId, Long jobId);
}