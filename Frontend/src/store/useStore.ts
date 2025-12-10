import { create } from 'zustand';
import axios from 'axios';

export interface Employee {
  id: string;
  employmentCode: string;
  // Personal Details
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  // Professional Details
  position: string;
  department: string;
  joiningDate: string;
  employmentType: string;
  manager: string;
  // Finance Details
  salary: number;
  bankAccount: string;
  taxId: string;
  avatar?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo: string[]; // employee IDs
  deadline: string;
  progress: number;
  createdBy: string;
  createdAt: string;
}

export interface Message {
  id: string;
  from: string; // user ID
  to: string;   // user ID
  content: string;
  timestamp: string;
  read: boolean;
}

interface User {
  id: string; // "admin-1" | "user-emp-EMP002"
  email: string;
  role: 'admin' | 'employee';
  employeeId?: string; // optional, not used for chat
}

interface StoreState {
  user: User | null;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
    role: 'admin' | 'employee',
    employmentCode?: string
  ) => Promise<boolean>;
  logout: () => void;

  employees: Employee[];
  fetchEmployeesFromApi: () => Promise<void>;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  getEmployeeById: (id: string) => Employee | undefined;

  projects: Project[];
  fetchProjectsFromApi: () => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectsByEmployee: (employeeId: string) => Project[];

  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp' | 'read'>) => void;
  markMessageAsRead: (id: string) => void;
  getConversation: (userId1: string, userId2: string) => Message[];
  getUnreadCount: (userId: string) => number;
}

export const useStore = create<StoreState>((set, get) => ({
  user: null,
  isAuthenticated: false,

  login: async (
    email: string,
    password: string,
    role: 'admin' | 'employee',
    employmentCode?: string
  ) => {
    // ADMIN LOGIN
    if (role === 'admin') {
      try {
        await axios.post('http://localhost:8081/api/admin/login', {
          email,
          password,
        });

        set({
          user: { id: 'admin-1', email, role: 'admin' },
          isAuthenticated: true,
        });
        return true;
      } catch {
        return false;
      }
    }

    // EMPLOYEE LOGIN – dynamic for ANY employmentCode
    if (role === 'employee') {
      try {
        if (!employmentCode) {
          console.error('❌ login called for employee without employmentCode');
          return false;
        }

        // optional: verify with backend if needed
        await axios.post('http://localhost:8081/api/employee/login', {
          email,
          password,
          employmentCode,
        }).catch(() => {
          // if you do not have this endpoint yet, you can remove this call
        });

        set({
          user: {
            id: `user-emp-${employmentCode}`, // e.g. "user-emp-EMP010"
            email,
            role: 'employee',
            // employeeId can be set later if you want to map to emp.id from backend
          },
          isAuthenticated: true,
        });

        console.log('✅ EMPLOYEE LOGIN SUCCESS:', {
          employmentCode,
          email,
        });
        return true;
      } catch (error) {
        console.error('Employee login error:', error);
        return false;
      }
    }

    return false;
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  // Employees
  employees: [],

  fetchEmployeesFromApi: async () => {
    try {
      const res = await axios.get(
        'http://localhost:8081/api/employee/personal/all'
      );
      const mapped: Employee[] = res.data.map((emp: any) => ({
        id: emp.id.toString(),
        employmentCode: emp.employmentCode,
        firstName: emp.fullName?.split(' ')[0] || 'Unknown',
        lastName: emp.fullName?.split(' ').slice(1).join(' ') || '',
        email: emp.personalEmail,
        phone: emp.mobile,
        dateOfBirth: emp.dateOfBirth,
        address: emp.currentCity,
        position: `${emp.gender}, ${emp.age} yrs`,
        department: emp.currentCity,
        joiningDate: emp.dateOfBirth,
        employmentType: 'Full-time',
        manager: 'Admin',
        salary: 30000,
        bankAccount: '****0000',
        taxId: 'N/A',
      }));
      set({ employees: mapped });
    } catch (error) {
      console.error('Failed to fetch employees into store', error);
    }
  },

  addEmployee: (employee) => {
    const newEmployee = {
      ...employee,
      id: `emp-${Date.now()}`,
    };
    set((state) => ({ employees: [...state.employees, newEmployee] }));
  },

  updateEmployee: (id, employeeData) => {
    set((state) => ({
      employees: state.employees.map((emp) =>
        emp.id === id ? { ...emp, ...employeeData } : emp
      ),
    }));
  },

  deleteEmployee: (id) => {
    set((state) => ({
      employees: state.employees.filter((emp) => emp.id !== id),
    }));
  },

  getEmployeeById: (id) => {
    return get().employees.find((emp) => emp.id === id);
  },

  // Projects
  projects: [],

  fetchProjectsFromApi: async () => {
    try {
      const res = await axios.get('http://localhost:8081/api/projects/all');
      const mapped: Project[] = res.data.map((p: any) => ({
        id: p.id.toString(),
        title: p.title,
        description: p.description,
        status: p.status as 'pending' | 'in-progress' | 'completed',
        assignedTo: p.assignedTo ?? [],
        deadline: p.deadline,
        progress: p.progress ?? 0,
        createdBy: p.createdBy ?? 'admin-1',
        createdAt: p.createdAt ?? new Date().toISOString(),
      }));
      set({ projects: mapped });
    } catch (error) {
      console.error('Failed to fetch projects into store', error);
    }
  },

  addProject: (project) => {
    const newProject = {
      ...project,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ projects: [...state.projects, newProject] }));
  },

  updateProject: (id, projectData) => {
    set((state) => ({
      projects: state.projects.map((proj) =>
        proj.id === id ? { ...proj, ...projectData } : proj
      ),
    }));
  },

  deleteProject: (id) => {
    set((state) => ({
      projects: state.projects.filter((proj) => proj.id !== id),
    }));
  },

  getProjectsByEmployee: (employeeId) => {
    return get().projects.filter((proj) => proj.assignedTo.includes(employeeId));
  },

  // Messages in Zustand (not used by Redux chat UI, you can keep or remove)
  messages: [
    {
      id: 'msg-1',
      from: 'admin-1',
      to: 'user-emp-1',
      content: 'Great work on the website redesign project!',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: true,
    },
    {
      id: 'msg-2',
      from: 'user-emp-1',
      to: 'admin-1',
      content: 'Thank you! I need one day leave next week.',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      read: false,
    },
  ],

  addMessage: (message) => {
    const newMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    set((state) => ({ messages: [...state.messages, newMessage] }));
  },

  markMessageAsRead: (id) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, read: true } : msg
      ),
    }));
  },

  getConversation: (userId1, userId2) => {
    return get()
      .messages
      .filter(
        (msg) =>
          (msg.from === userId1 && msg.to === userId2) ||
          (msg.from === userId2 && msg.to === userId1)
      )
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() -
          new Date(b.timestamp).getTime()
      );
  },

  getUnreadCount: (userId) => {
    return get().messages.filter((msg) => msg.to === userId && !msg.read).length;
  },
}));
