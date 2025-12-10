package com.ems.Entities;
import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "employee_professional_details")
public class EmployeeProfessionalDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 6, nullable = false, unique = true)
    private String employmentCode;

    private String companyEmail;

    @Column(nullable = false)
    private String employeePassword;

    private String officePhone;

    private String city;

    private String officeAddressLine1;
    private String officeAddressLine2;
    private String officePincode;

    private String reportingManagerCode;
    private String reportingManagerEmail;

    private String hrName;

    @Lob
    private String employmentHistory;

    private LocalDate dateOfJoining;
}

