package com.ems.Services;

import com.ems.DTO.EmployeeProfessionalDetailsDTO;
import com.ems.Entities.EmployeeProfessionalDetails;
import com.ems.Repositories.EmployeeProfessionalDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class EmployeeProfessionalDetailsService {

    @Autowired
    private EmployeeProfessionalDetailsRepository repo;

    public String saveProfessionalDetails(EmployeeProfessionalDetailsDTO dto) {
        if (repo.findByEmploymentCode(dto.getEmploymentCode()).isPresent()) {
            throw new RuntimeException("Employee Professional details already exist for this employment code!");
        }

        EmployeeProfessionalDetails pro = new EmployeeProfessionalDetails();
        pro.setEmploymentCode(dto.getEmploymentCode());
        pro.setCompanyEmail(dto.getCompanyEmail());
        pro.setEmployeePassword(dto.getEmployeePassword());
        pro.setOfficePhone(dto.getOfficePhone());
        pro.setCity(dto.getCity());
        pro.setOfficeAddressLine1(dto.getOfficeAddressLine1());
        pro.setOfficeAddressLine2(dto.getOfficeAddressLine2());
        pro.setOfficePincode(dto.getOfficePincode());
        pro.setReportingManagerCode(dto.getReportingManagerCode());
        pro.setReportingManagerEmail(dto.getReportingManagerEmail());
        pro.setHrName(dto.getHrName());
        pro.setEmploymentHistory(dto.getEmploymentHistory());

        if (dto.getDateOfJoining() != null && !dto.getDateOfJoining().isEmpty()) {
            pro.setDateOfJoining(LocalDate.parse(dto.getDateOfJoining()));
        }

        repo.save(pro);
        return "Professional details saved successfully!";
    }

    public EmployeeProfessionalDetails getProfessionalDetails(String employmentCode) {
        return repo.findByEmploymentCode(employmentCode)
                .orElseThrow(() -> new RuntimeException("No professional details found for: " + employmentCode));
    }

    // ⭐ NEW: Fetch all professional details
    public List<EmployeeProfessionalDetails> getAllProfessionalDetails() {
        return repo.findAll();
    }
}
