package com.jobportal.backend.controller;

import com.jobportal.backend.model.Profile;
import com.jobportal.backend.model.User;
import com.jobportal.backend.model.Education;
import com.jobportal.backend.model.Experience;
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

    @org.springframework.beans.factory.annotation.Autowired
    private com.jobportal.backend.service.FileStorageService fileStorageService;

    public ProfileController(ProfileRepository profileRepository, UserRepository userRepository) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/my-profile")
    public ResponseEntity<?> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User identity scope missing"));

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

        // Atomically map core persistent field inputs
        existingProfile.setFirstName(profileRequest.getFirstName());
        existingProfile.setLastName(profileRequest.getLastName());
        existingProfile.setPhone(profileRequest.getPhone());
        existingProfile.setHeadline(profileRequest.getHeadline());
        existingProfile.setProfilePicUrl(profileRequest.getProfilePicUrl());
        existingProfile.setResumeUrl(profileRequest.getResumeUrl());

        // Update basic string skills array element collection lines
        existingProfile.setSkills(profileRequest.getSkills());

        // Clean out and rebuild transient child relational Education lines safely
        if (existingProfile.getEducationList() != null) {
            existingProfile.getEducationList().clear();
        } else {
            existingProfile.setEducationList(new java.util.ArrayList<>());
        }
        if (profileRequest.getEducationList() != null) {
            for (Education edu : profileRequest.getEducationList()) {
                edu.setProfile(existingProfile);
                existingProfile.getEducationList().add(edu);
            }
        }

        // Clean out and rebuild transient child relational Experience lines safely
        if (existingProfile.getExperienceList() != null) {
            existingProfile.getExperienceList().clear();
        } else {
            existingProfile.setExperienceList(new java.util.ArrayList<>());
        }
        if (profileRequest.getExperienceList() != null) {
            for (Experience exp : profileRequest.getExperienceList()) {
                exp.setProfile(existingProfile);
                existingProfile.getExperienceList().add(exp);
            }
        }

        profileRepository.save(existingProfile);
        return ResponseEntity.ok("Success: Profile updated successfully!");
    }

    @GetMapping("/download-resume/{userId}")
    public ResponseEntity<org.springframework.core.io.Resource> downloadResume(
            @PathVariable Long userId
    ) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Profile data logs not found"));

        if (profile.getResumeUrl() == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            String cleanPath = profile.getResumeUrl().startsWith("/") ? profile.getResumeUrl().substring(1) : profile.getResumeUrl();
            java.nio.file.Path filePath = java.nio.file.Paths.get(cleanPath);
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            String downloadName = String.format("%s_%s_Resume.pdf",
                    profile.getFirstName().replaceAll("\\s+", ""),
                    profile.getLastName().replaceAll("\\s+", ""));

            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadName + "\"")
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping(value = "/upload-resume", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadResumeFile(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new UsernameNotFoundException("User identity scope missing"));

            String fileUrl = fileStorageService.storeFile(file);

            Profile existingProfile = profileRepository.findByUserId(user.getId())
                    .orElseGet(() -> Profile.builder().user(user).build());

            existingProfile.setResumeUrl(fileUrl);
            profileRepository.save(existingProfile);

            return ResponseEntity.ok(java.util.Map.of("resumeUrl", fileUrl, "message", "Success: Resume uploaded successfully!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Server Error: Unable to process file upload.");
        }
    }
}
