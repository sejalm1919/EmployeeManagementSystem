package com.ems.DTO;

import lombok.Data;

@Data
public class EmployeeFinanceDetailsDTO {

    private String employmentCode;
    private String panCard;
    private String aadharCard;

    private String bankName;
    private String bankBranch;
    private String ifscCode;

    private String ctcBreakup;
}
