package com.ems.Entities;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "employee_finance_details")
public class EmployeeFinanceDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 6, nullable = false, unique = true)
    private String employmentCode;

    private String panCard;
    private String aadharCard;

    private String bankName;
    private String bankBranch;
    private String ifscCode;

    @Lob
    private String ctcBreakup;
}

