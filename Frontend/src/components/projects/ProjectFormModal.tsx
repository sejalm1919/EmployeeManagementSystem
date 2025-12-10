import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input-field';
import { GlassCard } from '@/components/ui/glass-card';
import { useStore, Project } from '@/store/useStore';
import toast from 'react-hot-toast';
import axios from 'axios';

interface ProjectFormModalProps {
  onClose: () => void;
  project?: Project;
  onSuccess?: () => void;
}

type FormData = {
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo: string[];
  deadline: string;
  progress: number;
};

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  onClose,
  project,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    status: 'pending',
    assignedTo: [],
    deadline: '',
    progress: 0,
  });
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:8081/api/employee/personal/all');
      console.log('🔍 ProjectFormModal employees:', response.data);
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees for project:', error);
    }
  };

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEmployeeToggle = (employeeId: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(employeeId)
        ? prev.assignedTo.filter((id) => id !== employeeId)
        : [...prev.assignedTo, employeeId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.deadline) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const projectData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        deadline: formData.deadline,
        progress: formData.progress,
        assignedEmployeeIds: formData.assignedTo.map(id => parseInt(id)),
      };

      console.log('✅ Sending to /api/projects/add:', projectData);

      await axios.post('http://localhost:8081/api/projects/add', projectData);
      toast.success('✅ Project created successfully!');
      onClose();
      onSuccess?.();
    } catch (error: any) {
      console.error('Project API Error:', error.response?.data);
      toast.error('Failed to create project: ' + (error.response?.data?.message || 'Server error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Create New Project
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Project Title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter project title"
              required
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Enter project description"
                className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px] resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value as FormData['status'])}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <InputField
                label="Deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleChange('deadline', e.target.value)}
                required
              />
            </div>

            <InputField
              label="Progress (%)"
              type="number"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => handleChange('progress', parseInt(e.target.value) || 0)}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Assign Employees ({formData.assignedTo.length} selected)
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto p-2 border border-border rounded-lg">
                {employees.map((employee) => (
                  <label
                    key={employee.id}
                    className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer smooth-transition"
                  >
                    <input
                      type="checkbox"
                      checked={formData.assignedTo.includes(employee.id.toString())}
                      onChange={() => handleEmployeeToggle(employee.id.toString())}
                      className="w-4 h-4 rounded border-input"
                    />
                    <span className="text-sm text-foreground">
                      {employee.fullName} ({employee.employmentCode})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" className="gradient-accent" disabled={loading}>
                <Check size={18} className="mr-2" />
                {loading ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </form>
        </div>
      </GlassCard>
    </div>
  );
};
