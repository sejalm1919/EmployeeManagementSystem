package com.ems.Controllers;

import com.ems.DTO.EmployeeProfessionalDetailsDTO;
import com.ems.Entities.EmployeeProfessionalDetails;
import com.ems.Services.EmployeeProfessionalDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employee/professional")
@CrossOrigin(origins = "*")
public class EmployeeProfessionalDetailsController {

    @Autowired
    private EmployeeProfessionalDetailsService service;

    @PostMapping("/add")
    public ResponseEntity<String> addProfessionalDetails(@RequestBody EmployeeProfessionalDetailsDTO dto) {
        String result = service.saveProfessionalDetails(dto);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/get/{employmentCode}")
    public ResponseEntity<EmployeeProfessionalDetails> getProfessionalDetails(@PathVariable String employmentCode) {
        EmployeeProfessionalDetails details = service.getProfessionalDetails(employmentCode);
        return ResponseEntity.ok(details);
    }

    // ⭐ NEW: Get all employee professional details
    @GetMapping("/all")
    public ResponseEntity<List<EmployeeProfessionalDetails>> getAllProfessionalDetails() {
        List<EmployeeProfessionalDetails> detailsList = service.getAllProfessionalDetails();
        return ResponseEntity.ok(detailsList);
    }
}
