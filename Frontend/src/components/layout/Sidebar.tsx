import React from 'react';
import { Users, FolderKanban, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems = [
  { id: 'employees', label: 'Employees', icon: Users },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSectionChange,
  collapsed,
  onToggleCollapse,
}) => {
  return (
    <aside
      className={cn(
        // full-height, floating glass sidebar
        'h-screen bg-gradient-to-b from-sidebar/95 to-sidebar/90 text-sidebar-foreground',
        'border-r border-sidebar-border/60 backdrop-blur-xl shadow-xl',
        'smooth-transition flex flex-col sticky top-0',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Top brand + collapse */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border/60">
        {!collapsed && (
          <h2 className="text-lg font-semibold tracking-tight bg-gradient-to-r from-sidebar-primary to-accent bg-clip-text text-transparent">
            EMS Admin
          </h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="text-sidebar-foreground hover:bg-sidebar-accent rounded-full"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                'smooth-transition',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_0_20px_rgba(0,0,0,0.25)]'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom small footer */}
      <div className="px-4 py-3 border-t border-sidebar-border/60 text-[11px] text-sidebar-foreground/60">
        {!collapsed && <p>© {new Date().getFullYear()} EMS Console</p>}
      </div>
    </aside>
  );
};