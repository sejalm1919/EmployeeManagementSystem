import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input-field';
import { GlassCard } from '@/components/ui/glass-card';
import { useStore, Employee } from '@/store/useStore';
import toast from 'react-hot-toast';

interface EmployeeFormWizardProps {
  onClose: () => void;
  employee?: Employee;
}

type FormData = Omit<Employee, 'id'>;

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  address: '',
  position: '',
  department: '',
  joiningDate: '',
  employmentType: 'Full-time',
  manager: 'Admin',
  salary: 0,
  bankAccount: '',
  taxId: '',
};

export const EmployeeFormWizard: React.FC<EmployeeFormWizardProps> = ({
  onClose,
  employee,
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(
    employee ? { ...employee } : initialFormData
  );
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const addEmployee = useStore((state) => state.addEmployee);
  const updateEmployee = useStore((state) => state.updateEmployee);

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (step === 1) {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.phone) newErrors.phone = 'Phone is required';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.address) newErrors.address = 'Address is required';
    } else if (step === 2) {
      if (!formData.position) newErrors.position = 'Position is required';
      if (!formData.department) newErrors.department = 'Department is required';
      if (!formData.joiningDate) newErrors.joiningDate = 'Joining date is required';
    } else if (step === 3) {
      if (!formData.salary) newErrors.salary = 'Salary is required';
      if (!formData.bankAccount) newErrors.bankAccount = 'Bank account is required';
      if (!formData.taxId) newErrors.taxId = 'Tax ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    if (!validateStep()) return;

    if (employee) {
      updateEmployee(employee.id, formData);
      toast.success('Employee updated successfully!');
    } else {
      addEmployee(formData);
      toast.success('Employee added successfully!');
    }
    onClose();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 animate-slide-in-right">
            <h3 className="text-xl font-semibold text-foreground mb-4">Personal Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                error={errors.firstName}
                placeholder="John"
              />
              <InputField
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                error={errors.lastName}
                placeholder="Doe"
              />
            </div>
            <InputField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
              placeholder="john.doe@company.com"
            />
            <InputField
              label="Phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              error={errors.phone}
              placeholder="+1 234 567 8900"
            />
            <InputField
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              error={errors.dateOfBirth}
            />
            <InputField
              label="Address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              error={errors.address}
              placeholder="123 Main St, City, State"
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 animate-slide-in-right">
            <h3 className="text-xl font-semibold text-foreground mb-4">Professional Details</h3>
            <InputField
              label="Position"
              value={formData.position}
              onChange={(e) => handleChange('position', e.target.value)}
              error={errors.position}
              placeholder="Senior Developer"
            />
            <InputField
              label="Department"
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
              error={errors.department}
              placeholder="Engineering"
            />
            <InputField
              label="Joining Date"
              type="date"
              value={formData.joiningDate}
              onChange={(e) => handleChange('joiningDate', e.target.value)}
              error={errors.joiningDate}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Employment Type</label>
              <select
                value={formData.employmentType}
                onChange={(e) => handleChange('employmentType', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </select>
            </div>
            <InputField
              label="Manager"
              value={formData.manager}
              onChange={(e) => handleChange('manager', e.target.value)}
              placeholder="Manager Name"
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 animate-slide-in-right">
            <h3 className="text-xl font-semibold text-foreground mb-4">Finance Details</h3>
            <InputField
              label="Salary (Annual)"
              type="number"
              value={formData.salary || ''}
              onChange={(e) => handleChange('salary', parseFloat(e.target.value))}
              error={errors.salary}
              placeholder="85000"
            />
            <InputField
              label="Bank Account"
              value={formData.bankAccount}
              onChange={(e) => handleChange('bankAccount', e.target.value)}
              error={errors.bankAccount}
              placeholder="****1234"
            />
            <InputField
              label="Tax ID"
              value={formData.taxId}
              onChange={(e) => handleChange('taxId', e.target.value)}
              error={errors.taxId}
              placeholder="TAX-001"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {employee ? 'Edit Employee' : 'Add New Employee'}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold smooth-transition ${
                      stepNumber < step
                        ? 'bg-success text-white'
                        : stepNumber === step
                        ? 'gradient-accent text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {stepNumber < step ? <Check size={20} /> : stepNumber}
                  </div>
                  <span className="ml-2 text-sm font-medium text-foreground hidden sm:inline">
                    {stepNumber === 1
                      ? 'Personal'
                      : stepNumber === 2
                      ? 'Professional'
                      : 'Finance'}
                  </span>
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded smooth-transition ${
                      stepNumber < step ? 'bg-success' : 'bg-muted'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Form */}
          {renderStep()}

          {/* Actions */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={step === 1 ? onClose : handleBack}
              className="smooth-transition"
            >
              <ChevronLeft size={20} className="mr-2" />
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>
            {step < 3 ? (
              <Button onClick={handleNext} className="gradient-accent smooth-transition">
                Next
                <ChevronRight size={20} className="ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="gradient-accent smooth-transition">
                <Check size={20} className="mr-2" />
                {employee ? 'Update' : 'Submit'}
              </Button>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
