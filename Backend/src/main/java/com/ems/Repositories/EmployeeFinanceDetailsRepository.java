package com.ems.Repositories;

import com.ems.Entities.EmployeeFinanceDetails;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmployeeFinanceDetailsRepository extends JpaRepository<EmployeeFinanceDetails, Long> {

    Optional<EmployeeFinanceDetails> findByEmploymentCode(String employmentCode);
}
