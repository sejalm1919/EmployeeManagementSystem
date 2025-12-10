package com.ems.Repositories;

import com.ems.Entities.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByAssignedEmployees_Id(Long employeeId);

    @Query("SELECT p FROM Project p LEFT JOIN FETCH p.assignedEmployees")
    List<Project> findAllWithEmployees();
}
