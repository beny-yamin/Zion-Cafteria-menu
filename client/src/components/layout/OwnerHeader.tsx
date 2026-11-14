import React from 'react';
import { LayoutDashboard, QrCode, Users, ChefHat, Plus, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeSwitcher } from './ThemeSwitcher.js';
import { useAuth } from '../../context/AuthContext.js';

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
  const { user } = useAuth();
  const hasTopNav = Boolean(user?.isDemo);

  return (
    <header className="sticky top-0 z-30 bg-cafe-card border-b border-cafe-border px-3 sm:px-6 py-2 sm:py-2.5 shadow-sm transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2.5 sm:space-x-4 min-w-0">
          <h1 className="font-black text-sm sm:text-base text-cafe-text tracking-tight shrink-0">
            Owner
          </h1>
          <nav className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`touch-target px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold flex items-center space-x-1 whitespace-nowrap shrink-0 transition-colors ${
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
              className={`touch-target px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold flex items-center space-x-1 whitespace-nowrap shrink-0 transition-colors ${
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
              className={`touch-target px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold flex items-center space-x-1 whitespace-nowrap shrink-0 transition-colors ${
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

        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          <button
            onClick={onOpenNewItem}
            className="touch-target px-2.5 sm:px-3 py-1.5 bg-cafe-amber hover:bg-cafe-amber-hover text-white text-xs font-bold rounded-xl flex items-center space-x-1 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
          {!hasTopNav && (
            <>
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
                onClick={onExit}
                className="touch-target w-8 h-8 rounded-xl border border-cafe-border text-cafe-muted hover:text-[#4B3024] hover:border-[#4B3024] flex items-center justify-center transition-colors"
                title="Exit"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
