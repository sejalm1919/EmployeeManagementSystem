package com.ems.Controllers;

import com.ems.DTO.EmployeeFinanceDetailsDTO;
import com.ems.Entities.EmployeeFinanceDetails;
import com.ems.Services.EmployeeFinanceDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/finance")
@CrossOrigin("*")
public class EmployeeFinanceDetailsController {

    @Autowired
    private EmployeeFinanceDetailsService financeService;

    @PostMapping("/add")
    public ResponseEntity<String> addFinanceDetails(@RequestBody EmployeeFinanceDetailsDTO dto) {
        String result = financeService.saveFinanceDetails(dto);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/get/{employmentCode}")
    public ResponseEntity<EmployeeFinanceDetails> getFinanceDetails(@PathVariable String employmentCode) {
        EmployeeFinanceDetails details = financeService.getFinanceDetails(employmentCode);
        return ResponseEntity.ok(details);
    }

    // ⭐ NEW: Get all employee finance details
    @GetMapping("/all")
    public ResponseEntity<List<EmployeeFinanceDetails>> getAllFinanceDetails() {
        List<EmployeeFinanceDetails> detailsList = financeService.getAllFinanceDetails();
        return ResponseEntity.ok(detailsList);
    }
}
