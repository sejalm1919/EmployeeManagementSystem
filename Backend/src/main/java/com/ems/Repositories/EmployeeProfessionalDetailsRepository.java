package com.ems.Repositories;

import com.ems.Entities.EmployeeProfessionalDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EmployeeProfessionalDetailsRepository extends JpaRepository<EmployeeProfessionalDetails, Long> {
    Optional<EmployeeProfessionalDetails> findByEmploymentCode(String employmentCode);
    Optional<EmployeeProfessionalDetails> findByCompanyEmail(String companyEmail);
}

