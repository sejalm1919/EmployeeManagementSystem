import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Eye,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Users,
  X,
  Briefcase,
  MapPin,
  User,
  Mail as MailIcon,
  Key,
  Phone as PhoneIcon,
  Clock,
  Banknote,
  Wallet,
  ReceiptIndianRupee,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { EmployeeFormSections } from '@/components/employees/EmployeeFormSections';
import { Employee } from '@/store/useStore';
import toast from 'react-hot-toast';
import axios from 'axios';

interface EmployeesSectionProps {
  focusedEmployeeId?: string;
}

type GenderFilter = 'all' | 'male' | 'female';
type SalarySort = 'none' | 'asc' | 'desc';

export const EmployeesSection: React.FC<EmployeesSectionProps> = ({ focusedEmployeeId }) => {
  const [showWizard, setShowWizard] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [professionalDetails, setProfessionalDetails] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // finance
  const [financeDetails, setFinanceDetails] = useState<any>(null);
  const [financeLoading, setFinanceLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'professional' | 'finance'>('professional');

  // filters
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('all');
  const [salarySort, setSalarySort] = useState<SalarySort>('none');

  // ✅ AUTO-FETCH ON LOAD
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8081/api/employee/personal/all');
      const mappedEmployees: Employee[] = response.data.map((emp: any) => ({
        id: emp.id.toString(),
        employmentCode: emp.employmentCode,
        firstName: emp.fullName.split(' ')[0] || 'Unknown',
        lastName: emp.fullName.split(' ').slice(1).join(' ') || '',
        email: emp.personalEmail,
        phone: emp.mobile,
        position: `${emp.gender}, ${emp.age} yrs`,
        department: emp.currentCity,
        salary: 50000,
        joiningDate: emp.dateOfBirth,
        // keep raw gender if your Employee type supports it (optional)
        gender: emp.gender,
      }));
      setEmployees(mappedEmployees);
      toast.success(`Loaded ${mappedEmployees.length} employees!`);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FETCH PROFESSIONAL DETAILS FOR MODAL (use employmentCode passed in)
  const fetchProfessionalDetails = async (employeeId: string, employmentCode: string) => {
    try {
      setModalLoading(true);
      const response = await axios.get('http://localhost:8081/api/employee/professional/all');
      const employeeDetails = response.data.find(
        (emp: any) =>
          emp.employmentCode === employmentCode || emp.id?.toString() === employeeId
      );
      setProfessionalDetails(employeeDetails || null);
    } catch (error) {
      console.error('Failed to fetch professional details:', error);
      toast.error('Failed to load professional details');
      setProfessionalDetails(null);
    } finally {
      setModalLoading(false);
    }
  };

  // ✅ FETCH FINANCE DETAILS FOR MODAL (using your DTO fields)
  const fetchFinanceDetails = async (employmentCode: string) => {
    try {
      setFinanceLoading(true);
      const response = await axios.get('http://localhost:8081/finance/all');

      const raw = response.data.find((f: any) => f.employmentCode === employmentCode);

      if (!raw) {
        setFinanceDetails(null);
        return;
      }

      const mapped = {
        employmentCode: raw.employmentCode,
        panCard: raw.panCard,
        aadharCard: raw.aadharCard,
        bankBranch: raw.bankBranch,
        bankName: raw.bankName,
        ifscCode: raw.ifscCode,
        ctcBreakup: raw.ctcBreakup,
      };

      setFinanceDetails(mapped);
    } catch (error) {
      console.error('Failed to fetch finance details:', error);
      toast.error('Failed to load finance details');
      setFinanceDetails(null);
    } finally {
      setFinanceLoading(false);
    }
  };

  const handleViewAll = async (employee: Employee) => {
    setSelectedEmployee(employee);
    setActiveTab('professional');

    await fetchProfessionalDetails(employee.id, employee.employmentCode);
    await fetchFinanceDetails(employee.employmentCode);

    setShowEmployeeModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      try {
        setEmployees(employees.filter((emp) => emp.id !== id));
        toast.success('Employee deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete employee');
      }
    }
  };

  const handleCloseWizard = () => {
    setShowWizard(false);
    setSelectedEmployee(undefined);
    fetchEmployees();
  };

  const handleCloseModal = () => {
    setShowEmployeeModal(false);
    setSelectedEmployee(undefined);
    setProfessionalDetails(null);
    setFinanceDetails(null);
  };

  // When dashboard passes a focusedEmployeeId, just select + scroll to that employee (no modal)
  useEffect(() => {
    if (!focusedEmployeeId || employees.length === 0) return;
    const emp = employees.find((e) => e.id === focusedEmployeeId);
    if (emp) {
      setSelectedEmployee(emp);
      const el = document.getElementById(`employee-card-${emp.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [focusedEmployeeId, employees]);

  // derived list with filters + sort
  const visibleEmployees = useMemo(() => {
    let list = [...employees];

    // gender filter using raw gender inside position string
    if (genderFilter !== 'all') {
      const target = genderFilter === 'male' ? 'male' : 'female';
      list = list.filter((e) =>
        (e.position || '').toLowerCase().includes(target)
      );
    }

    if (salarySort === 'asc') {
      list.sort((a, b) => a.salary - b.salary);
    } else if (salarySort === 'desc') {
      list.sort((a, b) => b.salary - a.salary);
    }

    return list;
  }, [employees, genderFilter, salarySort]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Employees ({visibleEmployees.length})
          </h2>
          <p className="text-sm text-muted-foreground">Manage your team members</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Gender filter */}
          {/* <div className="flex items-center gap-1 bg-muted/40 rounded-full px-2 py-1">
            <span className="text-xs text-muted-foreground px-1">Gender:</span>
            <Button
              size="xs"
              variant={genderFilter === 'all' ? 'default' : 'ghost'}
              className="text-xs px-2 py-1"
              onClick={() => setGenderFilter('all')}
            >
              All
            </Button>
            <Button
              size="xs"
              variant={genderFilter === 'male' ? 'default' : 'ghost'}
              className="text-xs px-2 py-1"
              onClick={() => setGenderFilter('male')}
            >
              Male
            </Button>
            <Button
              size="xs"
              variant={genderFilter === 'female' ? 'default' : 'ghost'}
              className="text-xs px-2 py-1"
              onClick={() => setGenderFilter('female')}
            >
              Female
            </Button>
          </div> */}

          {/* Salary sort */}
          {/* <div className="flex items-center gap-1 bg-muted/40 rounded-full px-2 py-1">
            <span className="text-xs text-muted-foreground px-1">Salary:</span>
            <Button
              size="xs"
              variant={salarySort === 'none' ? 'default' : 'ghost'}
              className="text-xs px-2 py-1"
              onClick={() => setSalarySort('none')}
            >
              None
            </Button>
            <Button
              size="xs"
              variant={salarySort === 'asc' ? 'default' : 'ghost'}
              className="text-xs px-2 py-1"
              onClick={() => setSalarySort('asc')}
            >
              Low → High
            </Button>
            <Button
              size="xs"
              variant={salarySort === 'desc' ? 'default' : 'ghost'}
              className="text-xs px-2 py-1"
              onClick={() => setSalarySort('desc')}
            >
              High → Low
            </Button>
          </div> */}

          {/* Refresh / Add */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchEmployees}>
              🔄 Refresh
            </Button>
            <Button
              onClick={() => setShowWizard(true)}
              className="gradient-accent smooth-transition hover:scale-105 shadow-glow"
              size="sm"
            >
              <Plus size={18} className="mr-2" />
              Add Employee
            </Button>
          </div>
        </div>
      </div>

      {/* Employee Cards (filtered + sorted) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {visibleEmployees.map((employee) => (
          <GlassCard
            key={employee.id}
            id={`employee-card-${employee.id}`}
            hover
            className={`p-6 ${
              selectedEmployee?.id === employee.id
                ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                : ''
            }`}
          >
            <div className="space-y-4">
              {/* Avatar & Name */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center text-white font-bold text-lg">
                    {employee.firstName[0]}
                    {employee.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {employee.firstName} {employee.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {employee.position} | {employee.employmentCode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail size={14} />
                  <span className="truncate">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone size={14} />
                  <span>{employee.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar size={14} />
                  <span>Joined {new Date(employee.joiningDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Department Badge */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  {employee.department}
                </span>
                <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-medium">
                  ₹{employee.salary.toLocaleString()}/-
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewAll(employee)}
                  className="flex-1 smooth-transition hover:bg-primary/10"
                >
                  <Eye size={14} className="mr-2" />
                  View More
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(employee.id)}
                  className="flex-1 smooth-transition hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 size={14} className="mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Empty State */}
      {visibleEmployees.length === 0 && !loading && (
        <GlassCard className="p-12 text-center">
          <Users size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No employees found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Try changing filters or add a new employee
          </p>
          <Button onClick={() => setShowWizard(true)} className="gradient-accent">
            <Plus size={18} className="mr-2" />
            Add Employee
          </Button>
        </GlassCard>
      )}

      {/* Wizard */}
      {showWizard && (
        <EmployeeFormSections onClose={handleCloseWizard} employee={selectedEmployee} />
      )}

      {/* ✅ MODAL: PROFESSIONAL + FINANCE DETAILS */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <GlassCard className="w-full max-w-6xl max-h-[90vh] overflow-y-auto smooth-transition hover:shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full gradient-accent flex items-center justify-center text-white font-bold text-xl">
                  {selectedEmployee?.firstName?.[0]}
                  {selectedEmployee?.lastName?.[0]}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {selectedEmployee?.firstName} {selectedEmployee?.lastName}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedEmployee?.employmentCode}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant={activeTab === 'professional' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('professional')}
                >
                  <Briefcase size={16} className="mr-1" />
                  Professional
                </Button>
                <Button
                  variant={activeTab === 'finance' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('finance')}
                >
                  <Banknote size={16} className="mr-1" />
                  Finance
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseModal}
                  className="hover:bg-background/50 rounded-full p-2"
                >
                  <X size={20} />
                </Button>
              </div>
            </div>

            {/* BODY */}
            <div className="p-6">
              {/* PROFESSIONAL DETAILS CARD */}
              {activeTab === 'professional' && (
                <>
                  {modalLoading ? (
                    <div className="flex items-center justify-center p-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading professional details...</p>
                      </div>
                    </div>
                  ) : professionalDetails ? (
                    <GlassCard className="p-8 bg-gradient-to-br from-background/50 to-background/20 backdrop-blur-sm border border-border/30">
                      <h3 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
                        <Briefcase size={28} className="text-primary" />
                        Professional Details of {selectedEmployee?.firstName}{' '}
                        {selectedEmployee?.lastName}
                      </h3>

                      <div className="space-y-6">
                        {/* Company Contact */}
                        <div>
                          <h4 className="font-semibold text-lg mb-4 text-primary flex items-center gap-2">
                            <MailIcon size={20} className="text-primary" />
                            Company Contact
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl">
                              <MailIcon size={18} />
                              <div className="min-w-0">
                                <p className="text-xs text-muted-foreground font-medium">
                                  Company Email
                                </p>
                                <p className="font-semibold max-w-[320px] truncate">
                                  {professionalDetails.companyEmail || 'N/A'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-secondary/5 rounded-xl">
                              <PhoneIcon size={18} />
                              <div>
                                <p className="text-xs text-muted-foreground font-medium">
                                  Office Phone
                                </p>
                                <p className="font-semibold">
                                  {professionalDetails.officePhone || 'N/A'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-accent/5 rounded-xl">
                              <Key size={18} />
                              <div>
                                <p className="text-xs text-muted-foreground font-medium">
                                  Password
                                </p>
                                <p className="font-semibold text-destructive/80">●●●●●●●●</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Office Address */}
                        <div>
                          <h4 className="font-semibold text-lg mb-4 text-primary flex items-center gap-2">
                            <MapPin size={20} className="text-primary" />
                            Office Address
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3 p-4 bg-secondary/5 rounded-xl">
                              <MapPin size={18} className="mt-1" />
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground font-medium mb-2">
                                  Address
                                </p>
                                <p className="font-semibold">
                                  {professionalDetails.officeAddressLine1 || 'N/A'}
                                  {professionalDetails.officeAddressLine1 &&
                                    professionalDetails.officeAddressLine2 && <br />}
                                  {professionalDetails.officeAddressLine2 || ''}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {professionalDetails.city || 'N/A'},{' '}
                                  {professionalDetails.officePincode || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Reporting Structure */}
                        <div>
                          <h4 className="font-semibold text-lg mb-4 text-primary flex items-center gap-2">
                            <User size={20} className="text-primary" />
                            Reporting Structure
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl">
                              <User size={18} />
                              <div>
                                <p className="text-xs text-muted-foreground font-medium">
                                  Reporting Manager
                                </p>
                                <p className="font-semibold">
                                  {professionalDetails.reportingManagerCode || 'N/A'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-secondary/5 rounded-xl">
                              <MailIcon size={18} />
                              <div className="min-w-0">
                                <p className="text-xs text-muted-foreground font-medium">
                                  Manager Email
                                </p>
                                <p className="font-semibold max-w-[320px] truncate">
                                  {professionalDetails.reportingManagerEmail || 'N/A'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-accent/5 rounded-xl">
                              <User size={18} />
                              <div>
                                <p className="text-xs text-muted-foreground font-medium">
                                  HR Contact
                                </p>
                                <p className="font-semibold">
                                  {professionalDetails.hrName || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Employment History & Date */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {professionalDetails.employmentHistory && (
                            <div className="flex items-start gap-3 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-border/50">
                              <Clock size={20} className="mt-1 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wider">
                                  Employment History
                                </p>
                                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                                  {professionalDetails.employmentHistory}
                                </p>
                              </div>
                            </div>
                          )}

                          {professionalDetails.dateOfJoining && (
                            <div className="flex items-center justify-center p-6 bg-primary/5 rounded-xl border-2 border-primary/20">
                              <div className="text-center">
                                <Calendar size={32} className="mx-auto mb-3 text-primary" />
                                <p className="text-2xl font-bold text-foreground">
                                  {new Date(
                                    professionalDetails.dateOfJoining
                                  ).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-muted-foreground font-medium mt-1">
                                  Date of Joining
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  ) : (
                    <div className="text-center py-12">
                      <Users size={48} className="mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        No professional details found
                      </h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        This employee doesn't have professional information
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* FINANCE DETAILS CARD */}
              {activeTab === 'finance' && (
                <>
                  {financeLoading ? (
                    <div className="flex items-center justify-center p-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading finance details...</p>
                      </div>
                    </div>
                  ) : financeDetails ? (
                    <GlassCard className="p-8 bg-gradient-to-br from-background/50 to-background/20 backdrop-blur-sm border border-border/30">
                      <h3 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
                        <Banknote size={28} className="text-primary" />
                        Finance Details of {selectedEmployee?.firstName}{' '}
                        {selectedEmployee?.lastName}
                      </h3>

                      <div className="space-y-6">
                        {/* CTC & PAN / Aadhar */}
                        <div>
                          <h4 className="font-semibold text-lg mb-4 text-primary flex items-center gap-2">
                            <ReceiptIndianRupee size={20} className="text-primary" />
                            Compensation
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl">
                              <Banknote size={18} />
                              <div>
                                <p className="text-xs text-muted-foreground font-medium">
                                  CTC Breakup
                                </p>
                                <p className="font-semibold">
                                  {financeDetails.ctcBreakup || 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-secondary/5 rounded-xl">
                              <Banknote size={18} />
                              <div>
                                <p className="text-xs text-muted-foreground font-medium">
                                  PAN Card
                                </p>
                                <p className="font-semibold">
                                  {financeDetails.panCard || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bank Info */}
                        <div>
                          <h4 className="font-semibold text-lg mb-4 text-primary flex items-center gap-2">
                            <Wallet size={20} className="text-primary" />
                            Bank Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl">
                              <Wallet size={18} />
                              <div className="min-w-0">
                                <p className="text-xs text-muted-foreground font-medium">
                                  Bank Name
                                </p>
                                <p className="font-semibold max-w-[320px] truncate">
                                  {financeDetails.bankName || 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-secondary/5 rounded-xl">
                              <Wallet size={18} />
                              <div className="min-w-0">
                                <p className="text-xs text-muted-foreground font-medium">
                                  Bank Branch
                                </p>
                                <p className="font-semibold max-w-[320px] truncate">
                                  {financeDetails.bankBranch || 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-accent/5 rounded-xl">
                              <Wallet size={18} />
                              <div>
                                <p className="text-xs text-muted-foreground font-medium">
                                  IFSC Code
                                </p>
                                <p className="font-semibold">
                                  {financeDetails.ifscCode || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Identity */}
                        <div>
                          <h4 className="font-semibold text-lg mb-4 text-primary flex items-center gap-2">
                            <User size={20} className="text-primary" />
                            Identity
                          </h4>
                          <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl">
                            <User size={18} />
                            <div>
                              <p className="text-xs text-muted-foreground font-medium">
                                Aadhar Card
                              </p>
                              <p className="font-semibold">
                                {financeDetails.aadharCard || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  ) : (
                    <div className="text-center py-12">
                      <Users size={48} className="mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        No finance details found
                      </h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        This employee does not have finance records yet
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
