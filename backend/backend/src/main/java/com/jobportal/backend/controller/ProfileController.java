package com.jobportal.backend.controller;

import com.jobportal.backend.model.Profile;
import com.jobportal.backend.model.User;
import com.jobportal.backend.repository.ProfileRepository;
import com.jobportal.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profiles")
public class ProfileController {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    public ProfileController(ProfileRepository profileRepository, UserRepository userRepository) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/my-profile")
    public ResponseEntity<?> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User identity scope missing"));

        // Retrieve existing profile records or build an empty shell if it's a first-time setup
        Profile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> Profile.builder().user(user).build());

        return ResponseEntity.ok(profile);
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(
            @RequestBody Profile profileRequest,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User identity scope missing"));

        Profile existingProfile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> Profile.builder().user(user).build());

        // Atomically map text inputs over persistent fields
        existingProfile.setFirstName(profileRequest.getFirstName());
        existingProfile.setLastName(profileRequest.getLastName());
        existingProfile.setPhone(profileRequest.getPhone());
        existingProfile.setHeadline(profileRequest.getHeadline());
        existingProfile.setProfilePicUrl(profileRequest.getProfilePicUrl());
        existingProfile.setResumeUrl(profileRequest.getResumeUrl());

        profileRepository.save(existingProfile);
        return ResponseEntity.ok("Success: Profile updated successfully!");
    }
}
