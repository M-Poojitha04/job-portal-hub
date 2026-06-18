package com.jobportal.backend.controller;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.FileInputStream;
import java.io.OutputStream;

@RestController
public class SimpleFileStreamController {

    @GetMapping("/uploads/**")
    public void streamFileExplicitly(HttpServletRequest request, HttpServletResponse response) {
        try {
            // 1. Extract file path cleanly
            String uri = request.getRequestURI();

            // 2. Point directly to your absolute local directory layout
            File file = new File("C:/Users/pooji/job-portal-hub" + uri);

            if (!file.exists() || file.isDirectory()) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                return;
            }

            // 3. Set content type layouts safely
            if (file.getName().toLowerCase().endsWith(".pdf")) {
                response.setContentType("application/pdf");
            } else if (file.getName().toLowerCase().endsWith(".png")) {
                response.setContentType("image/png");
            }

            response.setHeader("Content-Disposition", "inline; filename=\"" + file.getName() + "\"");
            response.setContentLengthLong(file.length());

            // 4. Pipe file byte blocks directly out to the open tab
            try (FileInputStream fis = new FileInputStream(file); OutputStream os = response.getOutputStream()) {
                byte[] buffer = new byte[4096];
                int bytesRead;
                while ((bytesRead = fis.read(buffer)) != -1) {
                    os.write(buffer, 0, bytesRead);
                }
                os.flush();
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}