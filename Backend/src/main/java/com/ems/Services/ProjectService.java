package com.ems.Services;

import com.ems.DTO.ProjectDTO;
import com.ems.Entities.EmployeePersonalDetails;
import com.ems.Entities.Project;
import com.ems.Repositories.EmployeePersonalDetailsRepository;
import com.ems.Repositories.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepo;

    @Autowired
    private EmployeePersonalDetailsRepository personalRepo;

    // Admin adds a project
    public String createProject(ProjectDTO dto) {
        Project project = new Project();
        project.setTitle(dto.getTitle());
        project.setDescription(dto.getDescription());
        project.setStatus(dto.getStatus());
        project.setDeadline(dto.getDeadline());
        project.setProgress(dto.getProgress());

        // Fetch employees from employee_personal_details table
        if (dto.getAssignedEmployeeIds() != null && !dto.getAssignedEmployeeIds().isEmpty()) {
            List<EmployeePersonalDetails> employees = personalRepo.findAllById(dto.getAssignedEmployeeIds());
            project.setAssignedEmployees(employees);
        }

        projectRepo.save(project);
        return "Project created successfully!";
    }

    // Employee fetches only their projects
    public List<ProjectDTO> getProjectsForEmployee(Long employeeId) {
        List<Project> projects = projectRepo.findByAssignedEmployees_Id(employeeId);

        return projects.stream().map(project -> {
            ProjectDTO dto = new ProjectDTO();
            dto.setId(project.getId());  // ✅ Fixed: Added id to DTO
            dto.setTitle(project.getTitle());
            dto.setDescription(project.getDescription());
            dto.setStatus(project.getStatus());
            dto.setDeadline(project.getDeadline());
            dto.setProgress(project.getProgress());

            // Employee IDs for this project
            List<Long> assignedIds = project.getAssignedEmployees()
                    .stream()
                    .map(EmployeePersonalDetails::getId)
                    .toList();
            dto.setAssignedEmployeeIds(assignedIds);

            return dto;
        }).collect(Collectors.toList());
    }

    // ✅ FIXED: Use JOIN FETCH query!
    public List<ProjectDTO> getAllProjects() {
        // CRITICAL: This LOADS assignedEmployees from project_employees!
        List<Project> projects = projectRepo.findAllWithEmployees();

        return projects.stream().map(project -> {
            ProjectDTO dto = new ProjectDTO();
            dto.setId(project.getId());
            dto.setTitle(project.getTitle());
            dto.setDescription(project.getDescription());
            dto.setStatus(project.getStatus());
            dto.setDeadline(project.getDeadline());
            dto.setProgress(project.getProgress());

            List<Long> assignedIds = project.getAssignedEmployees() != null
                    ? project.getAssignedEmployees().stream()
                    .map(EmployeePersonalDetails::getId)
                    .toList()
                    : List.of();

            System.out.println("🔍 Project " + project.getId() + " employees: " + assignedIds);
            dto.setAssignedEmployeeIds(assignedIds);

            return dto;
        }).collect(Collectors.toList());
    }
}
