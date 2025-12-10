import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FolderKanban, MessageSquare, LogOut, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { Sidebar } from '@/components/layout/Sidebar';
import { useStore } from '@/store/useStore';
import { EmployeesSection } from './sections/EmployeesSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { ChatSection } from './sections/ChatSection';

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<'employees' | 'projects' | 'chat'>('employees');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedEmployeeId, setFocusedEmployeeId] = useState<string | null>(null);

  const navigate = useNavigate();
  const {
    user,
    logout,
    employees,
    projects,
    getUnreadCount,
    fetchEmployeesFromApi,
    fetchProjectsFromApi,
  } = useStore();

  // Load real employees & projects from backend once
  useEffect(() => {
    fetchEmployeesFromApi();
    fetchProjectsFromApi();
  }, [fetchEmployeesFromApi, fetchProjectsFromApi]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Base counts
  const totalEmployees = employees.length;
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'in-progress').length;
  const unreadMessages = user ? getUnreadCount(user.id) : 0;

  const employeeSubtitle = `${totalEmployees} employees in system`;
  const projectSubtitle = `${activeProjects} active • ${totalProjects} total`;

  // --- search logic on real employees from store ---
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const searchResults =
    normalizedQuery.length === 0
      ? []
      : employees
          .filter((emp) => {
            const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
            return (
              emp.firstName.toLowerCase().startsWith(normalizedQuery) ||
              emp.lastName.toLowerCase().startsWith(normalizedQuery) ||
              fullName.startsWith(normalizedQuery)
            );
          })
          .slice(0, 8); // limit dropdown size

  const handleSearchSelect = (employeeId: string) => {
    setActiveSection('employees');
    setFocusedEmployeeId(employeeId);
    setSearchQuery('');
    setSearchOpen(false);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'employees':
        return <EmployeesSection focusedEmployeeId={focusedEmployeeId || undefined} />;
      case 'projects':
        return <ProjectsSection />;
      case 'chat':
        return <ChatSection />;
      default:
        return <EmployeesSection focusedEmployeeId={focusedEmployeeId || undefined} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={(section) => {
          setActiveSection(section as any);
          if (section !== 'employees') {
            setFocusedEmployeeId(null);
          }
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-10 backdrop-blur-lg">
          <div className="flex items-center justify-between p-4 gap-4">
            {/* Left: title */}
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user?.email}
              </p>
            </div>

            {/* Center/right: search (only on employees) */}
            {activeSection === 'employees' && (
              <div className="relative max-w-sm w-full">
                {!searchOpen ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-muted-foreground gap-2"
                    onClick={() => setSearchOpen(true)}
                  >
                    <Search size={16} />
                    <span className="text-xs sm:text-sm">
                      Search employee by name…
                    </span>
                  </Button>
                ) : (
                  <div className="relative w-full">
                    <div className="flex items-center gap-2 border border-border rounded-lg px-2 py-1.5 bg-background">
                      <Search size={16} className="text-muted-foreground" />
                      <input
                        autoFocus
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Type to search employees…"
                        className="bg-transparent outline-none text-sm flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setSearchOpen(false);
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {searchQuery.trim().length > 0 && (
                      <div className="absolute mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-auto z-20">
                        {searchResults.length === 0 ? (
                          <div className="px-3 py-2 text-xs text-muted-foreground">
                            No employees found
                          </div>
                        ) : (
                          searchResults.map((emp) => (
                            <button
                              key={emp.id}
                              type="button"
                              onClick={() => handleSearchSelect(emp.id)}
                              className="w-full text-left px-3 py-2 hover:bg-muted flex flex-col"
                            >
                              <span className="text-sm font-medium text-foreground">
                                {emp.firstName} {emp.lastName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {emp.employmentCode}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Right: logout */}
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

        <div className="p-6 space-y-6">
          {/* Analytics Cards */}
          {activeSection === 'employees' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              <StatCard
                title="Total Employees"
                value={totalEmployees}
                icon={Users}
                trend={{ value: employeeSubtitle, isPositive: totalEmployees > 0 }}
                gradient
              />
              <StatCard
                title="Projects"
                value={totalProjects}
                icon={FolderKanban}
                trend={{ value: projectSubtitle, isPositive: activeProjects > 0 }}
                gradient
              />
              <StatCard
                title="Unread Messages"
                value={unreadMessages}
                icon={MessageSquare}
                trend={{ value: `${unreadMessages} awaiting response`, isPositive: unreadMessages === 0 }}
                gradient
              />
            </div>
          )}

          {/* Dynamic Section Content */}
          <div className="animate-fade-in">
            {renderSection()}
          </div>
        </div>
      </main>
    </div>
  );
}
