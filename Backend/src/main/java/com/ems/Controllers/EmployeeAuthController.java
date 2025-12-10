package com.ems.Controllers;

import com.ems.DTO.EmployeeLoginDTO;
import com.ems.Services.EmployeeAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employee")
@CrossOrigin(origins = "*")
public class EmployeeAuthController {

    @Autowired
    private EmployeeAuthService employeeAuthService;

    @PostMapping("/login")
    public ResponseEntity<String> loginEmployee(@RequestBody EmployeeLoginDTO loginDTO) {

        String employmentCode = employeeAuthService.loginEmployee(loginDTO);

        return ResponseEntity.ok(employmentCode); // RETURNING EMPLOYMENT CODE
    }
}
