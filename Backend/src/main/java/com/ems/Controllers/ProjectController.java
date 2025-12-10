package com.ems.Controllers;

import com.ems.DTO.ProjectDTO;
import com.ems.Entities.Project;
import com.ems.Services.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin("*")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    // ADMIN -> create a project
    @PostMapping("/add")
    public String createProject(@RequestBody ProjectDTO dto) {
        return projectService.createProject(dto);
    }

    // EMPLOYEE -> get only assigned projects
    @GetMapping("/employee/{employeeId}")
    public List<ProjectDTO> getProjectsForEmployee(@PathVariable Long employeeId) {
        return projectService.getProjectsForEmployee(employeeId);
    }

    // ADMIN -> get all projects
    @GetMapping("/all")
    public ResponseEntity<List<ProjectDTO>> getAllProjects() {
        List<ProjectDTO> projects = projectService.getAllProjects();
        return ResponseEntity.ok(projects);
    }
}
