import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, LayoutDashboard, ChefHat, Utensils, ArrowUpRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { UserRole } from '../../types/index.js';

export const DemoRoleShowcase: React.FC = () => {
  const navigate = useNavigate();
  const { demoLogin } = useAuth();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const handleDemoLaunch = async (targetRole: UserRole, targetPath: string) => {
    setLoadingRole(targetRole);
    try {
      await demoLogin(targetRole);
      navigate(targetPath);
    } catch (err) {
      console.error('Demo launch error', err);
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="w-full flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center space-x-2.5 mb-1.5">
          <div className="w-7 h-7 rounded-xl bg-cafe-amber/20 border border-cafe-amber/40 flex items-center justify-center text-cafe-amber shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm md:text-base text-[#FFF4E6] tracking-wide">Isolated Demo Sandbox</h3>
        </div>
        <p className="text-xs text-[#C5B49F] mb-4">
          Click any role to test features with safe sample data. Personal data and admin rights stay isolated.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* 1. Customer Experience */}
          <div className="bg-cafe-espresso/80 border border-cafe-amber/40 rounded-2xl p-4 flex flex-col justify-between space-y-3 backdrop-blur-md">
            <div className="flex items-center space-x-2 text-cafe-amber font-bold text-xs">
              <Smartphone className="w-4 h-4 text-cafe-amber" />
              <span className="text-[#FFF4E6]">1. Customer Experience</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/menu?table=1')}
              className="touch-target min-h-[44px] w-full py-2.5 px-3 bg-cafe-deep hover:bg-cafe-amber border border-cafe-amber/50 hover:border-cafe-amber text-[#FFF4E6] hover:text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow transition-all"
            >
              <span>Open Customer Menu</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-cafe-amber group-hover:text-white" />
            </button>
          </div>

          {/* 2. Owner Dashboard */}
          <div className="bg-cafe-espresso/80 border border-cafe-border/30 rounded-2xl p-4 flex flex-col justify-between space-y-3 backdrop-blur-md">
            <div className="flex items-center space-x-2 text-[#FFF4E6] font-bold text-xs">
              <LayoutDashboard className="w-4 h-4 text-cafe-amber" />
              <span className="text-[#FFF4E6]">2. Owner Dashboard</span>
            </div>
            <button
              type="button"
              disabled={loadingRole === 'Owner'}
              onClick={() => handleDemoLaunch('Owner', '/owner')}
              className="touch-target min-h-[44px] w-full py-2.5 px-3 bg-cafe-deep hover:bg-cafe-amber border border-cafe-border/40 hover:border-cafe-amber text-[#FFF4E6] hover:text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow transition-all disabled:opacity-50"
            >
              <span>{loadingRole === 'Owner' ? 'Launching...' : 'Explore as Owner'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-cafe-amber" />
            </button>
          </div>

          {/* 3. Kitchen Display (KDS) */}
          <div className="bg-cafe-espresso/80 border border-cafe-amber/40 rounded-2xl p-4 flex flex-col justify-between space-y-3 backdrop-blur-md">
            <div className="flex items-center space-x-2 text-cafe-amber font-bold text-xs">
              <ChefHat className="w-4 h-4 text-cafe-amber" />
              <span className="text-[#FFF4E6]">3. Kitchen Display (KDS)</span>
            </div>
            <button
              type="button"
              disabled={loadingRole === 'KitchenStaff'}
              onClick={() => handleDemoLaunch('KitchenStaff', '/kitchen')}
              className="touch-target min-h-[44px] w-full py-2.5 px-3 bg-cafe-deep hover:bg-cafe-amber border border-cafe-amber/50 hover:border-cafe-amber text-[#FFF4E6] hover:text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow transition-all disabled:opacity-50"
            >
              <span>{loadingRole === 'KitchenStaff' ? 'Launching...' : 'Explore as Kitchen'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-cafe-amber" />
            </button>
          </div>

          {/* 4. Floor Staff Console */}
          <div className="bg-cafe-espresso/80 border border-cafe-border/30 rounded-2xl p-4 flex flex-col justify-between space-y-3 backdrop-blur-md">
            <div className="flex items-center space-x-2 text-[#FFF4E6] font-bold text-xs">
              <Utensils className="w-4 h-4 text-cafe-amber" />
              <span className="text-[#FFF4E6]">4. Floor Staff Console</span>
            </div>
            <button
              type="button"
              disabled={loadingRole === 'Staff'}
              onClick={() => handleDemoLaunch('Staff', '/staff')}
              className="touch-target min-h-[44px] w-full py-2.5 px-3 bg-cafe-deep hover:bg-cafe-amber border border-cafe-border/40 hover:border-cafe-amber text-[#FFF4E6] hover:text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow transition-all disabled:opacity-50"
            >
              <span>{loadingRole === 'Staff' ? 'Launching...' : 'Explore as Staff'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-cafe-amber" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
