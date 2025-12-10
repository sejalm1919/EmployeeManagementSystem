import React, { useState } from 'react';
import { X, User, Briefcase, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input-field';
import { GlassCard } from '@/components/ui/glass-card';
import { useStore, Employee } from '@/store/useStore';
import toast from 'react-hot-toast';
import axios from 'axios'; 

interface EmployeeFormSectionsProps {
  onClose: () => void;
  employee?: Employee;
}

type FormData = {
  // Personal Details
  full_name: string;
  gender: string;
  mobile: string;
  age: string | number;
  current_address_line1: string;
  current_address_line2: string;
  current_city: string;
  current_pincode: string;
  permanent_address_line1: string;
  permanent_address_line2: string;
  permanent_city: string;
  permanent_pincode: string;
  personal_email: string;
  date_of_birth: string;
  emergency_contact_mobile: string;
  emergency_contact_name: string;
  employment_code: string;

  // Professional Details
  employmentCode: string;
  companyEmail: string;
  employeePassword: string;
  officePhone: string;
  city: string;
  officeAddressLine1: string;
  officeAddressLine2: string;
  officePincode: string;
  reportingManagerCode: string;
  reportingManagerEmail: string;
  hrName: string;
  employmentHistory: string;
  dateOfJoining: string;

  // Finance Details
  panCard: string;
  aadharCard: string;
  bankName: string;
  bankBranch: string;
  ifscCode: string;
  ctcBreakup: string;
};

const initialFormData: FormData = {
  // Personal Details
  full_name: '',
  gender: '',
  mobile: '',
  age: '',
  current_address_line1: '',
  current_address_line2: '',
  current_city: '',
  current_pincode: '',
  permanent_address_line1: '',
  permanent_address_line2: '',
  permanent_city: '',
  permanent_pincode: '',
  personal_email: '',
  date_of_birth: '',
  emergency_contact_mobile: '',
  emergency_contact_name: '',
  employment_code: '',

  // Professional Details
  employmentCode: '',
  companyEmail: '',
  employeePassword: '',
  officePhone: '',
  city: '',
  officeAddressLine1: '',
  officeAddressLine2: '',
  officePincode: '',
  reportingManagerCode: '',
  reportingManagerEmail: '',
  hrName: '',
  employmentHistory: '',
  dateOfJoining: '',

  // Finance Details
  panCard: '',
  aadharCard: '',
  bankName: '',
  bankBranch: '',
  ifscCode: '',
  ctcBreakup: '',
};

// --- DUMMY DATA FOR PRESENTATION ---

const DUMMY_PERSONAL_DATA: Partial<FormData> = {
  full_name: 'Sohail Shaikh',
  gender: 'Male',
  mobile: '9876543210',
  age: 23,
  current_address_line1: 'Andheri East',
  current_address_line2: 'Near Metro Station',
  current_city: 'Mumbai',
  current_pincode: '400069',
  permanent_address_line1: 'Kurla West',
  permanent_address_line2: 'Near Phoenix Mall',
  permanent_city: 'Mumbai',
  permanent_pincode: '400070',
  personal_email: 'sohail.personal@gmail.com',
  date_of_birth: '2002-06-22',
  emergency_contact_mobile: '9876501234',
  emergency_contact_name: 'Sohail Shaikh',
  employment_code: 'EMP001',
};

const DUMMY_PROFESSIONAL_DATA: Partial<FormData> = {
  employmentCode: 'EMP001',
  companyEmail: 'sohail@company.com',
  employeePassword: 'sohail@123', // Admin sets the initial password
  officePhone: '9840853098',
  city: 'Pune',
  officeAddressLine1: 'Hadapsar',
  officeAddressLine2: 'Baner',
  officePincode: '400001',
  reportingManagerCode: 'RM001',
  reportingManagerEmail: 'manager@company.com',
  hrName: 'Harrry',
  employmentHistory: 'Good',
  dateOfJoining: '2025-11-15',
};

const DUMMY_FINANCE_DATA: Partial<FormData> = {
  panCard: 'ABCDE1234F',
  aadharCard: '123456789123',
  bankName: 'HDFC Bank',
  bankBranch: 'Kharadi Branch',
  ifscCode: 'HDFC0001234',
  ctcBreakup: 'Base: 4L, HRA: 1L, Bonus: 0.5L',
};

// -------------------------------------

export const EmployeeFormSections: React.FC<EmployeeFormSectionsProps> = ({
  onClose,
  employee,
}) => {
  
  // FIX 1: Explicitly override sensitive fields to be blank, even when editing an employee,
  // to prevent displaying masked password or non-company email from Employee data.
  const employeeData = employee 
    ? { 
        ...initialFormData, 
        ...employee, 
        companyEmail: employee.companyEmail || '', 
        employeePassword: '', // MUST be cleared for security/re-entry
      } 
    : initialFormData;

  const [formData, setFormData] = useState<FormData>(employeeData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const addEmployee = useStore((state) => state.addEmployee);
  const updateEmployee = useStore((state) => state.updateEmployee);

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // --- DUMMY DATA HANDLERS ---
  const loadPersonalData = () => {
    setFormData(prev => ({ ...prev, ...DUMMY_PERSONAL_DATA }));
    toast.success('Dummy Personal Data Loaded!');
  };

  const loadProfessionalData = () => {
    setFormData(prev => ({ ...prev, ...DUMMY_PROFESSIONAL_DATA }));
    toast.success('Dummy Professional Data Loaded!');
  };

  const loadFinanceData = () => {
    setFormData(prev => ({ ...prev, ...DUMMY_FINANCE_DATA }));
    toast.success('Dummy Finance Data Loaded!');
  };
  // -----------------------------


  const validatePersonalDetails = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.full_name) newErrors.full_name = 'Full name is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.mobile) newErrors.mobile = 'Mobile is required';
    if (!formData.age) newErrors.age = 'Age is required';
    if (!formData.current_address_line1) newErrors.current_address_line1 = 'Current address line 1 is required';
    if (!formData.current_city) newErrors.current_city = 'Current city is required';
    if (!formData.current_pincode) newErrors.current_pincode = 'Current pincode is required';
    if (!formData.permanent_address_line1) newErrors.permanent_address_line1 = 'Permanent address line 1 is required';
    if (!formData.permanent_city) newErrors.permanent_city = 'Permanent city is required';
    if (!formData.permanent_pincode) newErrors.permanent_pincode = 'Permanent pincode is required';
    if (!formData.personal_email) newErrors.personal_email = 'Personal email is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    if (!formData.emergency_contact_mobile) newErrors.emergency_contact_mobile = 'Emergency contact mobile is required';
    if (!formData.emergency_contact_name) newErrors.emergency_contact_name = 'Emergency contact name is required';
    if (!formData.employment_code) newErrors.employment_code = 'Employment code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateProfessionalDetails = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.employmentCode) newErrors.employmentCode = 'Employment code is required';
    if (!formData.companyEmail) newErrors.companyEmail = 'Company email is required';
    if (!formData.employeePassword) newErrors.employeePassword = 'Employee password is required (must be set for new employee)';
    if (!formData.officePhone) newErrors.officePhone = 'Office phone is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.officeAddressLine1) newErrors.officeAddressLine1 = 'Office address line 1 is required';
    if (!formData.officePincode) newErrors.officePincode = 'Office pincode is required';
    if (!formData.reportingManagerCode) newErrors.reportingManagerCode = 'Reporting manager code is required';
    if (!formData.reportingManagerEmail) newErrors.reportingManagerEmail = 'Reporting manager email is required';
    if (!formData.hrName) newErrors.hrName = 'HR name is required';
    if (!formData.employmentHistory) newErrors.employmentHistory = 'Employment history is required';
    if (!formData.dateOfJoining) newErrors.dateOfJoining = 'Date of joining is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateFinanceDetails = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.panCard) newErrors.panCard = 'PAN card is required';
    if (!formData.aadharCard) newErrors.aadharCard = 'Aadhar card is required';
    if (!formData.bankName) newErrors.bankName = 'Bank name is required';
    if (!formData.bankBranch) newErrors.bankBranch = 'Bank branch is required';
    if (!formData.ifscCode) newErrors.ifscCode = 'IFSC code is required';
    if (!formData.ctcBreakup) newErrors.ctcBreakup = 'CTC breakup is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  // 1. Personal Details API
  const handlePersonalSubmit = async () => {
    if (validatePersonalDetails()) {
      try {
        const personalData = {
          employmentCode: String(formData.employment_code).trim(),
          fullName: formData.full_name,
          gender: formData.gender,
          mobile: formData.mobile,
          age: parseInt(String(formData.age)) || 0,
          currentCity: formData.current_city,
          currentAddressLine1: formData.current_address_line1,
          currentAddressLine2: formData.current_address_line2 || '',
          currentPincode: formData.current_pincode,
          permanentCity: formData.permanent_city,
          permanentAddressLine1: formData.permanent_address_line1,
          permanentAddressLine2: formData.permanent_address_line2 || '',
          permanentPincode: formData.permanent_pincode,
          personalEmail: formData.personal_email,
          dateOfBirth: formData.date_of_birth,
          emergencyContactMobile: formData.emergency_contact_mobile,
          emergencyContactName: formData.emergency_contact_name,
        };
        
        await axios.post('http://localhost:8081/api/employee/personal/add', personalData);
        toast.success(`✅ Personal details for ${personalData.employmentCode} saved!`);
      } catch (error: any) {
        console.error('API Error:', error.response?.data);
        toast.error('Failed to save personal details. Check console for details.');
      }
    } else {
        toast.error('Please fill all required Personal Details fields.');
    }
  };


  // 2. Professional Details API
  const handleProfessionalSubmit = async () => {
    if (validateProfessionalDetails()) {
      try {
        const professionalData = {
          employmentCode: formData.employmentCode,
          companyEmail: formData.companyEmail,
          employeePassword: formData.employeePassword,
          officePhone: formData.officePhone,
          city: formData.city,
          officeAddressLine1: formData.officeAddressLine1,
          officeAddressLine2: formData.officeAddressLine2,
          officePincode: formData.officePincode,
          reportingManagerCode: formData.reportingManagerCode,
          reportingManagerEmail: formData.reportingManagerEmail,
          hrName: formData.hrName,
          employmentHistory: formData.employmentHistory,
          dateOfJoining: formData.dateOfJoining,
        };

        await axios.post('http://localhost:8081/api/employee/professional/add', professionalData);
        toast.success(`✅ Professional details for ${professionalData.employmentCode} saved!`);
      } catch (error: any) {
         console.error('API Error:', error.response?.data);
        toast.error('Failed to save professional details. Check console for details.');
      }
    } else {
        toast.error('Please fill all required Professional Details fields.');
    }
  };

  // 3. Finance Details API
  const handleFinanceSubmit = async () => {
    if (validateFinanceDetails()) {
      try {
        const financeData = {
          employmentCode: String(formData.employment_code || formData.employmentCode).trim(), // Use either field for the code
          aadharCard: formData.aadharCard || '',
          panCard: formData.panCard || '',
          bankName: formData.bankName || '',
          bankBranch: formData.bankBranch || '',
          ifscCode: formData.ifscCode || '',
          ctcBreakup: formData.ctcBreakup || '',
        };
        
        const response = await axios.post('http://localhost:8081/finance/add', financeData);
        toast.success(`✅ Finance details for ${financeData.employmentCode} saved!`);

        // Final step: If adding a new employee, update the global state (optional)
        if (!employee) {
             addEmployee({
                id: Date.now(),
                ...formData,
                employmentCode: financeData.employmentCode,
             } as Employee);
        } else {
             updateEmployee({ ...employee, ...formData });
        }
        
        onClose(); // Close the form after successful submission
        
      } catch (error: any) {
        console.error('Finance API Error details:', error.response?.data);
        toast.error('Failed to save finance details: ' + (error.response?.data?.message || 'Server error'));
      }
    } else {
        toast.error('Please fill all required Finance Details fields.');
    }
  };



  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {employee ? 'Edit Employee' : 'Add New Employee'}
            </h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Personal Details Form */}
            <GlassCard className="p-6 border-2 border-primary/20">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3">
                   <div className="p-2 rounded-lg bg-primary/10">
                     <User className="w-5 h-5 text-primary" />
                   </div>
                   <h3 className="text-xl font-semibold text-foreground">Personal Details</h3>
                 </div>
                 {/* DUMMY DATA BUTTON */}
                 <Button onClick={loadPersonalData} variant="outline" size="sm">
                   Load EMP001 Data
                 </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <InputField
                  label="Full Name *"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  error={errors.full_name}
                  placeholder="John Doe"
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && <p className="text-xs text-destructive">{errors.gender}</p>}
                </div>
                <InputField
                  label="Mobile *"
                  value={formData.mobile}
                  onChange={(e) => handleChange('mobile', e.target.value)}
                  error={errors.mobile}
                  placeholder="9876543210"
                />
                <InputField
                  label="Age *"
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleChange('age', parseInt(e.target.value) || '')}
                  error={errors.age}
                  placeholder="30"
                />
                <InputField
                  label="Current Address Line 1 *"
                  value={formData.current_address_line1}
                  onChange={(e) => handleChange('current_address_line1', e.target.value)}
                  error={errors.current_address_line1}
                  placeholder="123 Main Street"
                />
                <InputField
                  label="Current Address Line 2"
                  value={formData.current_address_line2}
                  onChange={(e) => handleChange('current_address_line2', e.target.value)}
                  error={errors.current_address_line2}
                  placeholder="Apt 4B"
                />
                <InputField
                  label="Current City *"
                  value={formData.current_city}
                  onChange={(e) => handleChange('current_city', e.target.value)}
                  error={errors.current_city}
                  placeholder="Mumbai"
                />
                <InputField
                  label="Current Pincode *"
                  value={formData.current_pincode}
                  onChange={(e) => handleChange('current_pincode', e.target.value)}
                  error={errors.current_pincode}
                  placeholder="400001"
                />
                <InputField
                  label="Permanent Address Line 1 *"
                  value={formData.permanent_address_line1}
                  onChange={(e) => handleChange('permanent_address_line1', e.target.value)}
                  error={errors.permanent_address_line1}
                  placeholder="456 Old Road"
                />
                <InputField
                  label="Permanent Address Line 2"
                  value={formData.permanent_address_line2}
                  onChange={(e) => handleChange('permanent_address_line2', e.target.value)}
                  error={errors.permanent_address_line2}
                  placeholder="Near Market"
                />
                <InputField
                  label="Permanent City *"
                  value={formData.permanent_city}
                  onChange={(e) => handleChange('permanent_city', e.target.value)}
                  error={errors.permanent_city}
                  placeholder="Pune"
                />
                <InputField
                  label="Permanent Pincode *"
                  value={formData.permanent_pincode}
                  onChange={(e) => handleChange('permanent_pincode', e.target.value)}
                  error={errors.permanent_pincode}
                  placeholder="411001"
                />
                <InputField
                  label="Personal Email *"
                  type="email"
                  value={formData.personal_email}
                  onChange={(e) => handleChange('personal_email', e.target.value)}
                  error={errors.personal_email}
                  placeholder="john.doe@company.com"
                  autocomplete="off" // Added for browser autofill prevention
                />
                <InputField
                  label="Date of Birth *"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleChange('date_of_birth', e.target.value)}
                  error={errors.date_of_birth}
                />
                <InputField
                  label="Emergency Contact Mobile *"
                  value={formData.emergency_contact_mobile}
                  onChange={(e) => handleChange('emergency_contact_mobile', e.target.value)}
                  error={errors.emergency_contact_mobile}
                  placeholder="9876543210"
                />
                <InputField
                  label="Emergency Contact Name *"
                  value={formData.emergency_contact_name}
                  onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
                  error={errors.emergency_contact_name}
                  placeholder="Jane Doe"
                />
                <InputField
                  label="Employment Code *"
                  value={formData.employment_code}
                  onChange={(e) => handleChange('employment_code', e.target.value)}
                  error={errors.employment_code}
                  placeholder="EMP001"
                  autocomplete="off" // Added for browser autofill prevention
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handlePersonalSubmit} className="min-w-32">
                  Save Personal Details
                </Button>
              </div>
            </GlassCard>

            {/* Professional Details Form */}
            <GlassCard className="p-6 border-2 border-secondary/20">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3">
                   <div className="p-2 rounded-lg bg-secondary/10">
                     <Briefcase className="w-5 h-5 text-secondary" />
                   </div>
                   <h3 className="text-xl font-semibold text-foreground">Professional Details</h3>
                 </div>
                 {/* DUMMY DATA BUTTON */}
                 <Button onClick={loadProfessionalData} variant="outline" size="sm">
                   Load EMP001 Data
                 </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <InputField
                  label="Employment Code *"
                  value={formData.employmentCode}
                  onChange={(e) => handleChange('employmentCode', e.target.value)}
                  error={errors.employmentCode}
                  placeholder="EMP001"
                  autocomplete="off" // Added for browser autofill prevention
                />
                <InputField
                  label="Company Email *"
                  type="email"
                  value={formData.companyEmail}
                  onChange={(e) => handleChange('companyEmail', e.target.value)}
                  error={errors.companyEmail}
                  placeholder="company.email@company.com"
                  autocomplete="off" 
                />
                <InputField
                  label="Employee Password *"
                  type="password"
                  value={formData.employeePassword}
                  onChange={(e) => handleChange('employeePassword', e.target.value)}
                  error={errors.employeePassword}
                  placeholder="•••••••• (Enter New Password)"
                  autocomplete="new-password" 
                />
                <InputField
                  label="Office Phone *"
                  value={formData.officePhone}
                  onChange={(e) => handleChange('officePhone', e.target.value)}
                  error={errors.officePhone}
                  placeholder="+1234567890"
                />
                <InputField
                  label="City *"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  error={errors.city}
                  placeholder="City Name"
                />
                <InputField
                  label="Office Address Line 1 *"
                  value={formData.officeAddressLine1}
                  onChange={(e) => handleChange('officeAddressLine1', e.target.value)}
                  error={errors.officeAddressLine1}
                  placeholder="123 Office Street"
                />
                <InputField
                  label="Office Address Line 2"
                  value={formData.officeAddressLine2}
                  onChange={(e) => handleChange('officeAddressLine2', e.target.value)}
                  error={errors.officeAddressLine2}
                  placeholder="Suite 456"
                />
                <InputField
                  label="Office Pincode *"
                  value={formData.officePincode}
                  onChange={(e) => handleChange('officePincode', e.target.value)}
                  error={errors.officePincode}
                  placeholder="400001"
                />
                <InputField
                  label="Reporting Manager Code *"
                  value={formData.reportingManagerCode}
                  onChange={(e) => handleChange('reportingManagerCode', e.target.value)}
                  error={errors.reportingManagerCode}
                  placeholder="RM001"
                />
                <InputField
                  label="Reporting Manager Email *"
                  type="email"
                  value={formData.reportingManagerEmail}
                  onChange={(e) => handleChange('reportingManagerEmail', e.target.value)}
                  error={errors.reportingManagerEmail}
                  placeholder="manager.email@company.com"
                  autocomplete="off"
                />
                <InputField
                  label="HR Name *"
                  value={formData.hrName}
                  onChange={(e) => handleChange('hrName', e.target.value)}
                  error={errors.hrName}
                  placeholder="HR Person"
                />
                <InputField
                  label="Employment History *"
                  value={formData.employmentHistory}
                  onChange={(e) => handleChange('employmentHistory', e.target.value)}
                  error={errors.employmentHistory}
                  placeholder="Details about previous employment"
                />
                <InputField
                  label="Date of Joining *"
                  type="date"
                  value={formData.dateOfJoining}
                  onChange={(e) => handleChange('dateOfJoining', e.target.value)}
                  error={errors.dateOfJoining}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleProfessionalSubmit} variant="secondary" className="min-w-32">
                  Save Professional Details
                </Button>
              </div>
            </GlassCard>

            {/* Finance Details Form */}
            <GlassCard className="p-6 border-2 border-accent/20">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3">
                   <div className="p-2 rounded-lg bg-accent/10">
                     <DollarSign className="w-5 h-5 text-accent" />
                   </div>
                   <h3 className="text-xl font-semibold text-foreground">Finance Details</h3>
                 </div>
                 {/* DUMMY DATA BUTTON */}
                 <Button onClick={loadFinanceData} variant="outline" size="sm">
                   Load EMP001 Data
                 </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <InputField
                  label="PAN Card *"
                  value={formData.panCard}
                  onChange={(e) => handleChange('panCard', e.target.value)}
                  error={errors.panCard}
                  placeholder="ABCDE1234F"
                />
                <InputField
                  label="Aadhar Card *"
                  value={formData.aadharCard}
                  onChange={(e) => handleChange('aadharCard', e.target.value)}
                  error={errors.aadharCard}
                  placeholder="1234 5678 9123"
                />
                <InputField
                  label="Bank Name *"
                  value={formData.bankName}
                  onChange={(e) => handleChange('bankName', e.target.value)}
                  error={errors.bankName}
                  placeholder="State Bank of India"
                />
                <InputField
                  label="Bank Branch *"
                  value={formData.bankBranch}
                  onChange={(e) => handleChange('bankBranch', e.target.value)}
                  error={errors.bankBranch}
                  placeholder="Main Branch"
                />
                <InputField
                  label="IFSC Code *"
                  value={formData.ifscCode}
                  onChange={(e) => handleChange('ifscCode', e.target.value)}
                  error={errors.ifscCode}
                  placeholder="SBIN0001234"
                />
                <InputField
                  label="CTC Breakup *"
                  value={formData.ctcBreakup}
                  onChange={(e) => handleChange('ctcBreakup', e.target.value)}
                  error={errors.ctcBreakup}
                  placeholder="Details of cost to company"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button onClick={onClose} variant="outline">
                  Cancel
                </Button>
                <Button onClick={handleFinanceSubmit} className="min-w-32 bg-accent text-accent-foreground hover:bg-accent/90">
                  {employee ? 'Update Employee' : 'Add Employee'}
                </Button>
              </div>
            </GlassCard>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};