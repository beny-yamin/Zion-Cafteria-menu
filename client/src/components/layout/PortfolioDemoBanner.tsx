import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ShieldCheck, LogOut, RefreshCw, Smartphone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { UserRole } from '../../types/index.js';
import { ThemeSwitcher } from './ThemeSwitcher.js';

export const PortfolioDemoBanner: React.FC = () => {
  const { user, demoLogin, logout } = useAuth();
  const navigate = useNavigate();

  if (!user || !user.isDemo) return null;

  const handleRoleSwitch = async (targetRole: UserRole) => {
    try {
      const res = await demoLogin(targetRole);
      if (res.role === 'Owner') navigate('/owner');
      else navigate('/kitchen');
    } catch (e) {
      console.error('Demo switch error', e);
    }
  };

  const handleExitDemo = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside aria-label="Portfolio Demo Mode" className="sticky top-0 z-50 bg-cafe-deep text-[#FFF4E6] shadow-md border-b border-cafe-espresso px-3 sm:px-4 py-1.5 sm:py-2 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2 min-w-0">
          <span className="flex items-center px-2 py-0.5 rounded-full bg-cafe-amber/20 text-cafe-amber border border-cafe-amber/40 font-bold uppercase tracking-wider text-[10px] shrink-0">
            <Sparkles className="w-3 h-3 mr-1 text-cafe-amber" />
            Demo
          </span>
          <span className="hidden sm:inline text-[#C5B49F]">Role:</span>
          <span className="font-bold text-[#FFF4E6] bg-cafe-espresso px-2 py-0.5 rounded-lg border border-cafe-border/30 text-[11px] shrink-0">
            {user.role}
          </span>
          <span className="hidden md:flex items-center text-[11px] text-[#C5B49F] ml-2">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-cafe-amber" />
            Sample data only
          </span>
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5 sm:pb-0 scrollbar-none">
          <ThemeSwitcher compact={true} />
          {user.role !== 'Owner' && (
            <button
              onClick={() => handleRoleSwitch('Owner')}
              className="touch-target px-2.5 py-1 rounded-lg bg-cafe-espresso hover:bg-cafe-amber text-[#FFF4E6] hover:text-white border border-cafe-border/30 text-[11px] font-bold flex items-center space-x-1 transition-colors shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Owner</span>
            </button>
          )}
          {user.role !== 'KitchenStaff' && (
            <button
              onClick={() => handleRoleSwitch('KitchenStaff')}
              className="touch-target px-2.5 py-1 rounded-lg bg-cafe-espresso hover:bg-cafe-amber text-[#FFF4E6] hover:text-white border border-cafe-border/30 text-[11px] font-bold flex items-center space-x-1 transition-colors shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Kitchen</span>
            </button>
          )}
          <button
            onClick={() => navigate('/menu?table=1')}
            className="touch-target px-2.5 py-1 rounded-lg bg-cafe-espresso hover:bg-cafe-amber text-[#FFF4E6] hover:text-white border border-cafe-border/30 text-[11px] font-bold flex items-center space-x-1 transition-colors shrink-0"
          >
            <Smartphone className="w-3 h-3" />
            <span>Menu</span>
          </button>
          <button
            onClick={handleExitDemo}
            className="touch-target px-2.5 py-1 rounded-lg bg-[#4B3024] hover:bg-[#3A251B] text-[#FFF4E6] border border-[#4B3024] text-[11px] font-bold flex items-center space-x-1 ml-1 transition-colors shadow-sm shrink-0"
          >
            <LogOut className="w-3 h-3" />
            <span>Exit</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
