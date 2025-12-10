package com.ems.Entities;
import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "employee_personal_details")
public class EmployeePersonalDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 6, nullable = false, unique = true)
    private String employmentCode;

    private String fullName;

    private LocalDate dateOfBirth;

    private String gender;

    private Integer age;

    private String currentCity;
    private String currentAddressLine1;
    private String currentAddressLine2;
    private String currentPincode;

    private String permanentCity;
    private String permanentAddressLine1;
    private String permanentAddressLine2;
    private String permanentPincode;

    private String mobile;
    private String personalEmail;
    private String emergencyContactName;
    private String emergencyContactMobile;
}

