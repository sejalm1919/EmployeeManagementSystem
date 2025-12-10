package com.ems.DTO;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeePersonalDetailsDTO {
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

