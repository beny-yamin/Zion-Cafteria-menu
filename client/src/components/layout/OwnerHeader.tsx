import React from 'react';
import { LayoutDashboard, QrCode, Users, ChefHat, Plus, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeSwitcher } from './ThemeSwitcher.js';

interface OwnerHeaderProps {
  activeTab: 'analytics' | 'tables' | 'staff';
  setActiveTab: (tab: 'analytics' | 'tables' | 'staff') => void;
  onOpenNewItem: () => void;
  onExit: () => void;
}

export const OwnerHeader: React.FC<OwnerHeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewItem,
  onExit,
}) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-cafe-card border-b border-cafe-border px-3 sm:px-6 py-2.5 sm:py-3 shadow-sm transition-colors">
      <div className="max-w-6xl mx-auto flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <h1 className="font-black text-base sm:text-xl text-cafe-text tracking-tight truncate">
            Owner Dashboard
          </h1>

          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            <ThemeSwitcher compact={true} />
            <button
              onClick={() => navigate('/kitchen')}
              className="touch-target px-2.5 py-1.5 bg-cafe-card hover:bg-cafe-cream text-cafe-text text-xs font-bold rounded-xl flex items-center space-x-1 border border-cafe-border transition-colors"
              title="Kitchen"
            >
              <ChefHat className="w-3.5 h-3.5 text-cafe-amber" />
              <span className="hidden xs:inline">Kitchen</span>
            </button>
            <button
              onClick={onOpenNewItem}
              className="touch-target px-2.5 sm:px-3 py-1.5 bg-cafe-amber hover:bg-cafe-amber-hover text-white text-xs font-bold rounded-xl flex items-center space-x-1 shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
            <button
              onClick={onExit}
              className="touch-target w-9 h-9 rounded-xl border border-cafe-border text-cafe-muted hover:text-[#4B3024] hover:border-[#4B3024] flex items-center justify-center transition-colors"
              title="Exit"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <nav className="flex items-center space-x-1.5 overflow-x-auto pb-0.5 scrollbar-none -mx-1 px-1">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`touch-target px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'analytics'
                ? 'bg-cafe-amber text-white shadow-sm'
                : 'text-cafe-muted hover:bg-cafe-cream hover:text-cafe-text'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`touch-target px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'tables'
                ? 'bg-cafe-amber text-white shadow-sm'
                : 'text-cafe-muted hover:bg-cafe-cream hover:text-cafe-text'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Tables</span>
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`touch-target px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'staff'
                ? 'bg-cafe-amber text-white shadow-sm'
                : 'text-cafe-muted hover:bg-cafe-cream hover:text-cafe-text'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
