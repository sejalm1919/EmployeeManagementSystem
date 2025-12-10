import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  User,
  FolderKanban,
  MessageSquare,
  Calendar,
  Send,
  TrendingUp,
  Check,
  X,
  Edit2,
  Trash2,
  Building2,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { StatCard } from '@/components/ui/stat-card';
import { Progress } from '@/components/ui/progress';
import { useStore } from '@/store/useStore';
import { useChat } from '@/hooks/useChat';
import axios from 'axios';
import toast from 'react-hot-toast';

const statusColors: Record<'pending' | 'in-progress' | 'completed', string> = {
  pending: 'bg-warning/10 text-warning border-warning',
  'in-progress': 'bg-info/10 text-info border-info',
  completed: 'bg-success/10 text-success border-success',
};

const statusLabels: Record<'pending' | 'in-progress' | 'completed', string> = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  completed: 'Completed',
};

// --- Interfaces ---

interface EmployeePersonalDetailsResponse {
  employmentCode: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  age: number;
  currentCity: string;
  currentAddressLine1: string;
  currentAddressLine2: string;
  currentPincode: string;
  permanentCity: string;
  permanentAddressLine1: string;
  permanentAddressLine2: string;
  permanentPincode: string;
  mobile: string;
  personalEmail: string;
  emergencyContactName: string;
  emergencyContactMobile: string;
}

interface EmployeeProfessionalDetailsResponse {
  employmentCode: string;
  companyEmail: string;
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
}

interface EmployeePersonalDetailsUI {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  deadline: string;
  progress: number;
  assignedEmployeeIds?: string[];
}

export default function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'chat'>('profile');
  
  // Chat States
  const [messageText, setMessageText] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  
  // Profile States
  const [personalDetails, setPersonalDetails] = useState<EmployeePersonalDetailsUI | null>(null);
  const [professionalDetails, setProfessionalDetails] = useState<EmployeeProfessionalDetailsResponse | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Project States
  const [employeeProjects, setEmployeeProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { user, logout, employees } = useStore();
  const { sendMessage, getConversation, editMessage, deleteMessage } = useChat();

  const employmentCode = user?.id?.replace('user-emp-', '') || '';

  const currentEmployee =
    employmentCode && employees.length > 0
      ? employees.find((e) => e.employmentCode === employmentCode)
      : null;

  const conversation = user ? getConversation(user.id, 'admin-1') : [];
  const unreadCount = user
    ? getConversation(user.id, 'admin-1').filter(
        (m) => m.sender === 'admin-1' && m.receiver === user.id
      ).length
    : 0;

  // --- Effects ---

  useEffect(() => {
    if (activeTab === 'profile' && employmentCode && !personalDetails) {
      fetchProfileData();
    }
  }, [activeTab, employmentCode]);

  // 🔥 UPDATED: Fetches both Personal AND Professional details
  const fetchProfileData = async () => {
    if (!employmentCode) return;
    setLoadingProfile(true);
    
    try {
      // Execute both requests in parallel
      const [personalRes, professionalRes] = await Promise.all([
        axios.get<EmployeePersonalDetailsResponse>(
          `http://localhost:8081/api/employee/personal/${employmentCode}`
        ),
        axios.get<EmployeeProfessionalDetailsResponse>(
          `http://localhost:8081/api/employee/professional/get/${employmentCode}`
        )
      ]);

      // 1. Handle Personal Data
      const pData = personalRes.data;
      const fullName = pData.fullName || '';
      const [firstNameRaw, lastNameRaw = ''] = fullName.split(' ');
      
      const addressParts = [pData.currentCity, pData.currentPincode].filter(
        (p) => !!p && String(p).trim().length > 0
      );

      const uiDetails: EmployeePersonalDetailsUI = {
        firstName: firstNameRaw || currentEmployee?.firstName || '',
        lastName: lastNameRaw || currentEmployee?.lastName || '',
        email: pData.personalEmail || currentEmployee?.email || '',
        phone: pData.mobile || currentEmployee?.phone || '',
        dateOfBirth: pData.dateOfBirth || currentEmployee?.dateOfBirth || '',
        address: addressParts.join(', ') || currentEmployee?.address || '',
      };
      setPersonalDetails(uiDetails);

      // 2. Handle Professional Data
      setProfessionalDetails(professionalRes.data);

      toast.success('Profile details updated');
    } catch (error) {
      console.error('Error fetching profile details', error);
      toast.error('Could not load some profile information');
      
      // Fallback for personal details if API fails but we have store data
      if (currentEmployee && !personalDetails) {
        setPersonalDetails({
          firstName: currentEmployee.firstName,
          lastName: currentEmployee.lastName,
          email: currentEmployee.email,
          phone: currentEmployee.phone,
          dateOfBirth: currentEmployee.dateOfBirth,
          address: currentEmployee.address,
        });
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    const loadProjects = async () => {
      console.log('🔥 CALLING API: http://localhost:8081/api/projects/all');
      setLoadingProjects(true);
      
      try {
        const response = await axios.get('http://localhost:8081/api/projects/all');
        console.log('📦 API RESPONSE:', response.data);
        
        const allProjects = response.data.map((proj: any): Project => ({
            id: proj.id,
            title: proj.title || 'Untitled Project',
            description: proj.description || 'No description available',
            status: proj.status || 'pending',
            deadline: proj.deadline || '',
            progress: proj.progress || 0,
            assignedEmployeeIds: proj.assignedEmployeeIds,
        }));

        setEmployeeProjects(allProjects);
        
        if (allProjects.length > 0) {
          toast.success(`Loaded all ${allProjects.length} projects`);
        }
      } catch (error) {
        console.error('❌ API ERROR:', error);
        toast.error('Failed to load projects');
        setEmployeeProjects([]); // Clear or set fallback
      } finally {
        setLoadingProjects(false);
      }
    };

    if (user) {
      loadProjects();
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation.length, activeTab]);

  // --- Handlers ---

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !user) return;
    sendMessage(user.id, 'admin-1', messageText);
    setMessageText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEditMessage = (messageId: string, currentText: string) => {
    setEditingMessageId(messageId);
    setEditText(currentText);
  };

  const handleSaveEdit = () => {
    if (!editText.trim() || !editingMessageId) return;
    editMessage(editingMessageId, editText);
    setEditingMessageId(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditText('');
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <GlassCard className="p-8 text-center">
          <p className="text-foreground">Session expired. Please login again.</p>
          <Button onClick={handleLogout} className="mt-4">
            Back to Login
          </Button>
        </GlassCard>
      </div>
    );
  }

  const inProgressProjects = employeeProjects.filter((p) => p.status === 'in-progress').length;
  const completedProjects = employeeProjects.filter((p) => p.status === 'completed').length;

  // Helper to format office address from professional details
  const formatOfficeAddress = () => {
    if (!professionalDetails) return 'N/A';
    const parts = [
      professionalDetails.officeAddressLine1,
      professionalDetails.city,
      professionalDetails.officePincode
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center text-white font-bold text-lg">
              {(personalDetails?.firstName || currentEmployee?.firstName || 'E')[0]}
              {(personalDetails?.lastName || currentEmployee?.lastName || '')[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Welcome back, {personalDetails?.firstName || currentEmployee?.firstName || 'Employee'}!
              </h1>
              <p className="text-sm text-muted-foreground">
                {currentEmployee?.position || 'Employee'}
              </p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="smooth-transition hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut size={18} className="mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Projects"
            value={employeeProjects.length}
            icon={FolderKanban}
            gradient
          />
          <StatCard
            title="In Progress"
            value={inProgressProjects}
            icon={TrendingUp}
            gradient
          />
          <StatCard
            title="Completed"
            value={completedProjects}
            icon={TrendingUp}
            gradient
          />
        </div>

        <GlassCard className="p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium smooth-transition ${
                activeTab === 'profile'
                  ? 'gradient-accent text-white shadow-glow'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <User size={18} />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium smooth-transition ${
                activeTab === 'projects'
                  ? 'gradient-accent text-white shadow-glow'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <FolderKanban size={18} />
              Projects
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium smooth-transition relative ${
                activeTab === 'chat'
                  ? 'gradient-accent text-white shadow-glow'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <MessageSquare size={18} />
              Chat
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-destructive text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </GlassCard>

        {activeTab === 'profile' && (
          <GlassCard className="p-6 space-y-6">
            {loadingProfile ? (
              <div className="flex justify-center py-8">Loading profile details...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information Column */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <User size={18} />
                    Personal Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-muted-foreground text-xs mb-1">Full Name</p>
                      <p className="font-medium">{personalDetails?.firstName} {personalDetails?.lastName}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-muted-foreground text-xs mb-1">Personal Email</p>
                      <p className="font-medium">{personalDetails?.email}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-muted-foreground text-xs mb-1">Mobile</p>
                      <p className="font-medium">{personalDetails?.phone}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-muted-foreground text-xs mb-1">Date of Birth</p>
                      <p className="font-medium">{personalDetails?.dateOfBirth}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-muted-foreground text-xs mb-1">Home Address</p>
                      <p className="font-medium">{personalDetails?.address}</p>
                    </div>
                  </div>
                </div>

                {/* Professional Information Column */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Building2 size={18} />
                    Professional Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-muted-foreground text-xs mb-1">Company Email</p>
                            <p className="font-medium truncate" title={professionalDetails?.companyEmail}>
                                {professionalDetails?.companyEmail || 'N/A'}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-muted-foreground text-xs mb-1">Office Phone</p>
                            <p className="font-medium">{professionalDetails?.officePhone || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-muted-foreground text-xs mb-1">Date of Joining</p>
                      <p className="font-medium">{professionalDetails?.dateOfJoining || currentEmployee?.joiningDate || 'N/A'}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-muted-foreground text-xs mb-1">Reporting Manager</p>
                      <p className="font-medium">
                        {professionalDetails?.reportingManagerEmail || professionalDetails?.reportingManagerCode || currentEmployee?.manager || 'N/A'}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-muted-foreground text-xs mb-1">HR Representative</p>
                      <p className="font-medium">{professionalDetails?.hrName || 'N/A'}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="mt-0.5 text-muted-foreground" />
                        <div>
                            <p className="text-muted-foreground text-xs mb-1">Office Address</p>
                            <p className="font-medium">{formatOfficeAddress()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </GlassCard>
        )}

        {activeTab === 'projects' && (
          <GlassCard className="p-6 space-y-4">
            {loadingProjects ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-lg">Loading all projects...</div>
              </div>
            ) : employeeProjects.length === 0 ? (
              <div className="text-center py-12">
                <FolderKanban className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">No projects found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {employeeProjects.map((project) => (
                  <GlassCard key={project.id} hover className="p-6">
                    <div className="space-y-4">
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
                            statusColors[project.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {statusLabels[project.status as keyof typeof statusLabels] || project.status}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold text-foreground">
                            {project.progress}%
                          </span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar size={14} />
                        <span>
                          Due: {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
                        </span>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </GlassCard>
        )}

        {activeTab === 'chat' && (
          <GlassCard className="h-[600px] flex flex-col animate-fade-in">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                  A
                </div>
                <div>
                  <p className="font-semibold text-foreground">Admin</p>
                  <p className="text-xs text-muted-foreground">System Administrator</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4">
              {conversation.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No messages yet. Start a conversation!</p>
                </div>
              ) : (
                conversation.map((message) => {
                  const isFromEmployee = message.sender === user?.id;
                  const isEditing = editingMessageId === message.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isFromEmployee ? 'justify-end' : 'justify-start'} group`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg relative ${
                          isFromEmployee ? 'gradient-accent text-white' : 'bg-muted text-foreground'
                        }`}
                      >
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full px-2 py-1 bg-background text-foreground border border-input rounded text-sm"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button onClick={handleSaveEdit} className="p-1 hover:bg-success/20 rounded">
                                <Check size={16} className="text-success" />
                              </button>
                              <button onClick={handleCancelEdit} className="p-1 hover:bg-destructive/20 rounded">
                                <X size={16} className="text-destructive" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm">{message.text}</p>
                            <p className={`text-xs mt-1 ${isFromEmployee ? 'text-white/70' : 'text-muted-foreground'}`}>
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {isFromEmployee && (
                              <div className="absolute -right-20 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <button
                                  onClick={() => handleEditMessage(message.id, message.text)}
                                  className="p-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                                >
                                  <Edit2 size={14} className="text-foreground" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMessage(message.id)}
                                  className="p-2 bg-card border border-border rounded-lg hover:bg-destructive/20 transition-colors"
                                >
                                  <Trash2 size={14} className="text-destructive" />
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Button onClick={handleSendMessage} disabled={!messageText.trim()} className="gradient-accent">
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}