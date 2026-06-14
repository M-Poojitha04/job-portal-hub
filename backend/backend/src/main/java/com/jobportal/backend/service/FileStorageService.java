package com.jobportal.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileStorageService {

    // Target storage path folder locally
    private final Path fileStorageLocation = Paths.get("uploads/resumes").toAbsolutePath().normalize();

    public FileStorageService() {
        try {
            // Automatically initialize directories on server launch if missing
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where uploaded files will be stored.", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        // 1. Clean filename paths safely
        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));

        try {
            // 2. Security Check: Block path injection attacks
            if (originalFilename.contains("..")) {
                throw new IllegalArgumentException("Filename contains invalid path sequence: " + originalFilename);
            }

            // 3. Security Check: Enforce strict PDF format validation
            if (!originalFilename.toLowerCase().endsWith(".pdf")) {
                throw new IllegalArgumentException("Unauthorized extension! Only standard PDF resumes are allowed.");
            }

            // 4. Generate an absolute unique filename string using UUID
            String uniqueFileName = UUID.randomUUID().toString() + "_" + originalFilename;

            // 5. Copy the file stream bytes onto target disk storage path
            Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Return relative identifier path to write inside profiles metadata row
            return "/uploads/resumes/" + uniqueFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFilename + ". Please try again!", ex);
        }
    }
}