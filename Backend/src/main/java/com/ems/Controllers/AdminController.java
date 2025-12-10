package com.ems.Controllers;

import com.ems.DTO.AdminDTO;
import com.ems.Services.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin("*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AdminDTO adminDTO) {
        if (adminDTO.getEmail() == null || adminDTO.getPassword() == null) {
            return ResponseEntity.badRequest().body("Email and password are required");
        }

        boolean valid = adminService.validateLogin(adminDTO.getEmail(), adminDTO.getPassword());
        if (valid) {
            return ResponseEntity.ok().body(
                    java.util.Map.of("message", "Login successful", "token", "dummy-admin-token")
            );
        } else {
            return ResponseEntity.status(401).body(java.util.Map.of("message", "Invalid credentials"));
        }
    }
}
