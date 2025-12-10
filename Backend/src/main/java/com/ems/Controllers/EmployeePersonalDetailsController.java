package com.ems.Controllers;

import com.ems.DTO.EmployeePersonalDetailsDTO;
import com.ems.Entities.EmployeePersonalDetails;
import com.ems.Services.EmployeePersonalDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employee/personal")
@CrossOrigin(origins = "*")
public class EmployeePersonalDetailsController {

    @Autowired
    private EmployeePersonalDetailsService personalService;

    @PostMapping("/add")
    public ResponseEntity<String> addPersonalDetails(@RequestBody EmployeePersonalDetailsDTO dto) {
        String result = personalService.savePersonalDetails(dto);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{employmentCode}")
    public ResponseEntity<EmployeePersonalDetails> getPersonalDetails(
            @PathVariable String employmentCode) {
        EmployeePersonalDetails details = personalService.getPersonalDetails(employmentCode);
        return ResponseEntity.ok(details);
    }

    // ⭐ NEW: Get all employee personal details
    @GetMapping("/all")
    public ResponseEntity<List<EmployeePersonalDetails>> getAllPersonalDetails() {
        List<EmployeePersonalDetails> detailsList = personalService.getAllPersonalDetails();
        return ResponseEntity.ok(detailsList);
    }
}
