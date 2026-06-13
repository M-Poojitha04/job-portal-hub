package com.jobportal.backend.repository;

import com.jobportal.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Crucial for Spring Security authentication later
    Optional<User> findByEmail(String email);

    // Crucial for registration checks
    boolean existsByEmail(String email);
}
