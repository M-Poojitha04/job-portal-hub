package com.jobportal.backend.repository;

import com.jobportal.backend.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, Long> {
    // Derived query to find a profile by the associated user's ID
    java.util.Optional<Profile> findByUserId(Long userId);
}