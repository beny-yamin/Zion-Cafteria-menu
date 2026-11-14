import React from 'react';
import { ChefHat, Package, LogOut, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeSwitcher } from '../layout/ThemeSwitcher.js';
import { useAuth } from '../../context/AuthContext.js';

interface KitchenHeaderProps {
  orderCount: number;
  acceptedCount: number;
  preparingCount: number;
  readyCount: number;
  stageFilter: 'all' | 'new' | 'prep' | 'ready';
  setStageFilter: (filter: 'all' | 'new' | 'prep' | 'ready') => void;
  onOpenStock: () => void;
  onExit: () => void;
}

export const KitchenHeader: React.FC<KitchenHeaderProps> = ({
  orderCount,
  acceptedCount,
  preparingCount,
  readyCount,
  stageFilter,
  setStageFilter,
  onOpenStock,
  onExit,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const hasTopNav = Boolean(user?.isDemo);

  return (
    <header className="sticky top-0 z-30 bg-cafe-deep border-b border-cafe-espresso px-3 sm:px-6 py-2.5 sm:py-3.5 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-cafe-espresso border border-cafe-amber/40 rounded-lg flex items-center justify-center text-cafe-amber shrink-0">
            <ChefHat className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-black text-sm sm:text-lg tracking-wide uppercase text-[#FFF4E6] truncate">Kitchen</h1>
            <p className="text-[10px] sm:text-xs text-[#C5B49F] truncate">{orderCount} orders</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          <button
            onClick={onOpenStock}
            className="touch-target px-2.5 sm:px-3.5 py-1.5 bg-cafe-espresso hover:bg-cafe-amber text-[#FFF4E6] hover:text-white text-xs font-bold rounded-xl flex items-center space-x-1 border border-cafe-border/30 transition-colors"
          >
            <Package className="w-3.5 h-3.5 text-cafe-amber" />
            <span>Stock</span>
          </button>
          {!hasTopNav && (
            <>
              <ThemeSwitcher compact={true} />
              {user?.role === 'Owner' && (
                <button
                  onClick={() => navigate('/owner')}
                  className="touch-target px-2 sm:px-3 py-1.5 bg-cafe-espresso hover:bg-cafe-amber text-[#FFF4E6] hover:text-white text-xs font-bold rounded-xl flex items-center space-x-1 border border-cafe-border/30 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Owner</span>
                </button>
              )}
              <button
                onClick={onExit}
                className="touch-target w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-cafe-espresso hover:bg-[#4B3024] text-[#C5B49F] hover:text-[#FFF4E6] flex items-center justify-center border border-cafe-border/20 transition-colors"
                title="Exit"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="md:hidden flex items-center space-x-1.5 overflow-x-auto pt-2 pb-0.5 scrollbar-none">
        {(['all', 'new', 'prep', 'ready'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStageFilter(s)}
            className={`touch-target px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 capitalize ${
              stageFilter === s ? 'bg-cafe-amber text-white' : 'bg-cafe-espresso text-[#C5B49F]'
            }`}
          >
            {s === 'all'
              ? `All (${orderCount})`
              : s === 'new'
              ? `New (${acceptedCount})`
              : s === 'prep'
              ? `Prep (${preparingCount})`
              : `Ready (${readyCount})`}
          </button>
        ))}
      </div>
    </header>
  );
};
