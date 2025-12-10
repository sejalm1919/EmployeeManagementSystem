package com.ems.Services;

import com.ems.DTO.EmployeeLoginDTO;
import com.ems.Entities.EmployeeProfessionalDetails;
import com.ems.Repositories.EmployeeProfessionalDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EmployeeAuthService {

    @Autowired
    private EmployeeProfessionalDetailsRepository employeeRepo;

    public String loginEmployee(EmployeeLoginDTO dto) {

        EmployeeProfessionalDetails employee = employeeRepo
                .findByCompanyEmail(dto.getCompanyEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!employee.getEmployeePassword().equals(dto.getEmployeePassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        // Return employment code with Success Message
        String successful = " Login Successful For the Employee :  " ;
        return successful + employee.getEmploymentCode();
    }
}
