package com.ems.Services;

import com.ems.DTO.EmployeePersonalDetailsDTO;
import com.ems.Entities.EmployeePersonalDetails;
import com.ems.Repositories.EmployeePersonalDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeePersonalDetailsService {

    @Autowired
    private EmployeePersonalDetailsRepository personalRepo;

    public String savePersonalDetails(EmployeePersonalDetailsDTO dto) {
        if (personalRepo.findByEmploymentCode(dto.getEmploymentCode()).isPresent()) {
            throw new RuntimeException("Employee with this code already exists!");
        }

        EmployeePersonalDetails personal = new EmployeePersonalDetails();
        personal.setEmploymentCode(dto.getEmploymentCode());
        personal.setFullName(dto.getFullName());
        personal.setDateOfBirth(dto.getDateOfBirth());
        personal.setGender(dto.getGender());
        personal.setAge(dto.getAge());
        personal.setCurrentCity(dto.getCurrentCity());
        personal.setCurrentAddressLine1(dto.getCurrentAddressLine1());
        personal.setCurrentAddressLine2(dto.getCurrentAddressLine2());
        personal.setCurrentPincode(dto.getCurrentPincode());
        personal.setPermanentCity(dto.getPermanentCity());
        personal.setPermanentAddressLine1(dto.getPermanentAddressLine1());
        personal.setPermanentAddressLine2(dto.getPermanentAddressLine2());
        personal.setPermanentPincode(dto.getPermanentPincode());
        personal.setMobile(dto.getMobile());
        personal.setPersonalEmail(dto.getPersonalEmail());
        personal.setEmergencyContactName(dto.getEmergencyContactName());
        personal.setEmergencyContactMobile(dto.getEmergencyContactMobile());

        personalRepo.save(personal);
        return "Personal details saved successfully!";
    }

    public EmployeePersonalDetails getPersonalDetails(String employmentCode) {
        return personalRepo.findByEmploymentCode(employmentCode)
                .orElseThrow(() -> new RuntimeException("Personal details not found!"));
    }

    // ⭐ NEW: Fetch all employee personal details
    public List<EmployeePersonalDetails> getAllPersonalDetails() {
        return personalRepo.findAll();
    }
}
