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

    @GetMapping("/download-resume/{userId}")
    public ResponseEntity<org.springframework.core.io.Resource> downloadResume(
            @PathVariable Long userId
    ) {
        // 1. Fetch the profile details matching this user sequence context
        com.jobportal.backend.model.Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Profile data logs not found"));

        if (profile.getResumeUrl() == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            // 2. Resolve the local system disk storage paths context
            // Strips out the initial forward slash mapping path string fragment if present
            String cleanPath = profile.getResumeUrl().startsWith("/") ? profile.getResumeUrl().substring(1) : profile.getResumeUrl();
            java.nio.file.Path filePath = java.nio.file.Paths.get(cleanPath);
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            // 3. Formulate professional filename layout: e.g., "FirstName_LastName_Resume.pdf"
            String downloadName = String.format("%s_%s_Resume.pdf",
                    profile.getFirstName().replaceAll("\\s+", ""),
                    profile.getLastName().replaceAll("\\s+", ""));

            // 4. Return the stream response bundle injecting clear Content-Disposition headers matrix
            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadName + "\"")
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Inject our new service bean dependency at the top
    @org.springframework.beans.factory.annotation.Autowired
    private com.jobportal.backend.service.FileStorageService fileStorageService;

    @PostMapping(value = "/upload-resume", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadResumeFile(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new UsernameNotFoundException("User identity scope missing"));

            // 1. Write file to local disk directory and extract mapping URL
            String fileUrl = fileStorageService.storeFile(file);

            // 2. Update profile table data row atomically
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
