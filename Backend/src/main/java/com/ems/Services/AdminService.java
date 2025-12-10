package com.ems.Services;

import com.ems.Entities.Admin;
import com.ems.Repositories.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    public boolean validateLogin(String email, String password) {
        Optional<Admin> adminOpt = adminRepository.findByEmail(email);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            return admin.getPassword().equals(password); // For production, use hashed password check
        }
        return false;
    }
}

