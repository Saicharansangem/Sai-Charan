import React from 'react';
import { LayoutDashboard, User, Briefcase, Settings, LogOut, Menu } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, mobileOpen, setMobileOpen }) => {
  const navItems = [
    { id: 'profile', label: 'My Profile', icon: <User size={20} /> },
    { id: 'recommendations', label: 'Career Paths', icon: <LayoutDashboard size={20} /> },
    { id: 'matcher', label: 'Job Matcher', icon: <Briefcase size={20} /> },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out print:hidden
    ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:h-screen
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-600 bg-opacity-50 md:hidden print:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className={sidebarClasses}>
        <div className="flex items-center justify-center h-16 border-b border-gray-100">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
            NextStep
          </h1>
        </div>
        
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setMobileOpen(false);
              }}
              className={`
                flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200
                ${activeTab === item.id 
                  ? 'bg-indigo-50 text-indigo-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
            <button className="flex items-center w-full px-4 py-3 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors">
                <LogOut size={20} className="mr-3" />
                Sign Out
            </button>
        </div>
      </div>
    </>
  );
};
