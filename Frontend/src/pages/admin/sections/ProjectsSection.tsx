import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, Calendar, Users, FolderKanban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Progress } from '@/components/ui/progress';
import { useStore, Project } from '@/store/useStore';
import { ProjectFormModal } from '@/components/projects/ProjectFormModal';
import toast from 'react-hot-toast';
import axios from 'axios';

const statusColors: Record<'pending' | 'in-progress' | 'completed', string> = {
  pending: 'bg-warning/10 text-warning',
  'in-progress': 'bg-info/10 text-info',
  completed: 'bg-success/10 text-success',
};

const statusLabels: Record<'pending' | 'in-progress' | 'completed', string> = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  completed: 'Completed',
};

type StatusFilter = 'all' | 'pending' | 'in-progress' | 'completed';

export const ProjectsSection: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // status filter state
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // ✅ FIXED: Fetch employees FIRST, then projects
  useEffect(() => {
    const loadData = async () => {
      await fetchEmployees();
      await fetchProjects();
    };
    loadData();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8081/api/projects/all');

      const mappedProjects: Project[] = response.data.map((proj: any) => {
        const assignedIds =
          proj.assignedEmployeeIds ||
          proj.assignedEmployees?.map((e: any) => e.id) ||
          proj.employeeIds ||
          [];

        const rawStatus = (proj.status || '').toString().toLowerCase();
        const normalizedStatus: 'pending' | 'in-progress' | 'completed' =
          rawStatus === 'in-progress'
            ? 'in-progress'
            : rawStatus === 'completed'
            ? 'completed'
            : 'pending';

        return {
          id: proj.id.toString(),
          title: proj.title,
          description: proj.description || '',
          status: normalizedStatus,
          deadline: proj.deadline,
          progress: proj.progress || 0,
          assignedTo: Array.isArray(assignedIds)
            ? assignedIds.map((id: any) => id.toString())
            : [],
        };
      });

      setProjects(mappedProjects);
      toast.success(`Loaded ${mappedProjects.length} projects!`);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:8081/api/employee/personal/all');
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        setProjects(projects.filter((project) => project.id !== id));
        toast.success('Project deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProject(undefined);
    fetchProjects();
  };

  const getAssignedEmployeeNames = (employeeIds: string[]) => {
    if (employeeIds.length === 0) return '';

    const names = employeeIds
      .map((id) => {
        const emp = employees.find((e: any) => e.id.toString() === id);
        return emp ? emp.fullName : 'Unknown';
      })
      .filter(Boolean);

    return names.join(', ');
  };

  // derived list based on status filter
  const visibleProjects = useMemo(() => {
    if (statusFilter === 'all') return projects;
    return projects.filter((p) => p.status === statusFilter);
  }, [projects, statusFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Projects ({visibleProjects.length})
          </h2>
          <p className="text-sm text-muted-foreground">Track and manage all projects</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter chips */}
          <div className="flex items-center gap-1 bg-muted/40 rounded-full px-3 py-1">
            <span className="text-xs text-muted-foreground mr-1">Status:</span>
            <Button
              size="xs"
              variant={statusFilter === 'all' ? 'default' : 'ghost'}
              className="text-xs px-2 py-1"
              onClick={() => setStatusFilter('all')}
            >
              All
            </Button>
            <Button
              size="xs"
              variant={statusFilter === 'pending' ? 'default' : 'ghost'}
              className="text-xs px-2 py-1"
              onClick={() => setStatusFilter('pending')}
            >
              Pending
            </Button>
            <Button
              size="xs"
              variant={statusFilter === 'in-progress' ? 'default' : 'ghost'}
              className="text-xs px-2 py-1"
              onClick={() => setStatusFilter('in-progress')}
            >
              In Progress
            </Button>
            <Button
              size="xs"
              variant={statusFilter === 'completed' ? 'default' : 'ghost'}
              className="text-xs px-2 py-1"
              onClick={() => setStatusFilter('completed')}
            >
              Completed
            </Button>
          </div>

          {/* Refresh / New Project */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProjects}
              className="smooth-transition"
            >
              🔄 Refresh
            </Button>
            <Button
              onClick={() => setShowModal(true)}
              className="gradient-accent smooth-transition hover:scale-105 shadow-glow"
            >
              <Plus size={18} className="mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visibleProjects.map((project) => (
          <GlassCard key={project.id} hover className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {project.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    statusColors[project.status]
                  }`}
                >
                  {statusLabels[project.status]}
                </span>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold text-foreground">
                    {project.progress}%
                  </span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar size={14} />
                  <span className="truncate">
                    Due: {new Date(project.deadline).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users size={14} />
                  <span>{project.assignedTo.length} assigned</span>
                </div>
              </div>

              {/* Assigned Employees */}
              {project.assignedTo.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Assigned to:</p>
                  <p className="text-sm text-foreground">
                    {getAssignedEmployeeNames(project.assignedTo)}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {/* <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(project)}
                  className="flex-1 smooth-transition hover:bg-primary/10"
                >
                  <Edit size={14} className="mr-2" />
                  Edit
                </Button> */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(project.id)}
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
      {visibleProjects.length === 0 && !loading && (
        <GlassCard className="p-12 text-center">
          <FolderKanban size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No projects found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Try changing the status filter or create a new project
          </p>
          <Button onClick={() => setShowModal(true)} className="gradient-accent">
            <Plus size={18} className="mr-2" />
            New Project
          </Button>
        </GlassCard>
      )}

      {/* Form Modal */}
      {showModal && (
        <ProjectFormModal
          onClose={handleCloseModal}
          project={selectedProject}
          onSuccess={fetchProjects}
        />
      )}
    </div>
  );
};
