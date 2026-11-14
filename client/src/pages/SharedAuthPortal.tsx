import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { RealAuthForm } from '../components/auth/RealAuthForm.js';
import { DemoRoleShowcase } from '../components/auth/DemoRoleShowcase.js';
import { ThemeSwitcher } from '../components/layout/ThemeSwitcher.js';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';

export const SharedAuthPortal: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    if (user && !user.isDemo) {
      if (user.role === 'Owner') navigate('/owner');
      else if (user.role === 'KitchenStaff') navigate('/kitchen');
    }
  }, [user, navigate]);

  const isLuxury = theme === 'luxury';

  return (
    <div
      className="min-h-screen relative flex flex-col justify-between p-4 sm:p-6 md:p-8 bg-cafe-deep text-[#FFF4E6] selection:bg-cafe-amber selection:text-white bg-cover bg-center bg-no-repeat sm:bg-fixed transition-colors"
      style={{
        backgroundImage: isLuxury
          ? `
            radial-gradient(circle at 50% 12%, rgba(75, 48, 36, 0.35), transparent 45%),
            radial-gradient(circle at 15% 45%, rgba(41, 35, 38, 0.35), transparent 50%),
            linear-gradient(to bottom, rgba(23, 23, 25, 0.45), rgba(41, 35, 38, 0.65)),
            url('/zion-cafteria-background.png')
          `
          : `
            radial-gradient(circle at 50% 12%, rgba(233, 149, 36, 0.22), transparent 45%),
            radial-gradient(circle at 15% 45%, rgba(48, 34, 24, 0.30), transparent 50%),
            linear-gradient(to bottom, rgba(33, 23, 16, 0.40), rgba(48, 34, 24, 0.60)),
            url('/zion-cafteria-background.png')
          `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-2xl w-full mx-auto space-y-4 pt-2">
        <div className="flex justify-end">
          <ThemeSwitcher />
        </div>

        {/* Header with Warm / Luxury Branding */}
        <header className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-cafe-deep/90 border border-cafe-amber/50 rounded-2xl text-cafe-amber shadow-lg backdrop-blur-md">
            <Coffee className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#FFF4E6] tracking-tight drop-shadow-md">
            Zion Cafeteria
          </h1>
          <p className="text-[#E8DCCB] text-sm font-serif italic tracking-wide max-w-md mx-auto drop-shadow-sm">
            &ldquo;This is your home. Order what you like, it will be on the table.&rdquo;
          </p>
        </header>

        {/* Focused Authentication & Customer Access */}
        <div className="max-w-md mx-auto w-full">
          <RealAuthForm />
        </div>

        {/* Bottom Demo Access Trigger */}
        <div className="pt-4 flex flex-col items-center">
          <button
            type="button"
            onClick={() => setShowDemo((prev) => !prev)}
            className="touch-target inline-flex items-center space-x-2 text-xs font-bold text-[#C5B49F] hover:text-[#FFF4E6] bg-cafe-deep/80 hover:bg-cafe-espresso border border-cafe-border/30 px-4 py-2 rounded-full transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-cafe-amber" />
            <span>Demo</span>
            {showDemo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Reveal 3 Demo Roles on Click */}
          {showDemo && (
            <div className="w-full mt-4 bg-cafe-deep/80 backdrop-blur-md border border-cafe-border/30 rounded-3xl p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
              <DemoRoleShowcase />
            </div>
          )}
        </div>
      </div>

      <footer className="text-center text-[11px] text-[#C5B49F] py-4 mt-6">
        Zion Cafeteria • Full-Stack Hospitality Platform
      </footer>
    </div>
  );
};
