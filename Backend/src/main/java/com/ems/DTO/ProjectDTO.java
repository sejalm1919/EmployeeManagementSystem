package com.ems.DTO;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class ProjectDTO {

    private Long id;  // ✅ ADDED: Project ID
    private String title;
    private String description;
    private String status;
    private LocalDate deadline;
    private Integer progress;

    // List of employee_personal_details IDs assigned to this project
    private List<Long> assignedEmployeeIds;
}
