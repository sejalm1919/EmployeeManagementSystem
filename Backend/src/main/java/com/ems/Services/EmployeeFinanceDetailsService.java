package com.ems.Services;

import com.ems.DTO.EmployeeFinanceDetailsDTO;
import com.ems.Entities.EmployeeFinanceDetails;
import com.ems.Repositories.EmployeeFinanceDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeFinanceDetailsService {

    @Autowired
    private EmployeeFinanceDetailsRepository financeRepo;

    // SAVE finance details
    public String saveFinanceDetails(EmployeeFinanceDetailsDTO dto) {

        if (financeRepo.findByEmploymentCode(dto.getEmploymentCode()).isPresent()) {
            throw new RuntimeException("Finance details already exist for this employment code!");
        }

        EmployeeFinanceDetails finance = new EmployeeFinanceDetails();
        finance.setEmploymentCode(dto.getEmploymentCode());
        finance.setPanCard(dto.getPanCard());
        finance.setAadharCard(dto.getAadharCard());
        finance.setBankName(dto.getBankName());
        finance.setBankBranch(dto.getBankBranch());
        finance.setIfscCode(dto.getIfscCode());
        finance.setCtcBreakup(dto.getCtcBreakup());

        financeRepo.save(finance);
        return "Finance details saved successfully!";
    }

    // GET finance details
    public EmployeeFinanceDetails getFinanceDetails(String employmentCode) {
        return financeRepo.findByEmploymentCode(employmentCode)
                .orElseThrow(() -> new RuntimeException("No finance details found for: " + employmentCode));
    }

    // ⭐ NEW: Fetch all finance details
    public List<EmployeeFinanceDetails> getAllFinanceDetails() {
        return financeRepo.findAll();
    }
}
