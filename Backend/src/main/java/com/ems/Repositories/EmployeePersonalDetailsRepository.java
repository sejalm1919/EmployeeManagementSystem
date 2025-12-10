package com.ems.Repositories;

import com.ems.Entities.EmployeePersonalDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeePersonalDetailsRepository extends JpaRepository<EmployeePersonalDetails, Long> {

    Optional<EmployeePersonalDetails> findByEmploymentCode(String employmentCode);

    // ⭐ NEW: findAll() is inherited from JpaRepository, no additional method needed
}
