import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee } from 'lucide-react';
import { RealAuthForm } from '../components/auth/RealAuthForm.js';
import { DemoRoleShowcase } from '../components/auth/DemoRoleShowcase.js';
import { ThemeSwitcher } from '../components/layout/ThemeSwitcher.js';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';

export const SharedAuthPortal: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !user.isDemo) {
      if (user.role === 'Owner') navigate('/owner');
      else if (user.role === 'KitchenStaff') navigate('/kitchen');
      else navigate('/staff');
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
      <div className="max-w-5xl w-full mx-auto space-y-4 pt-2">
        <div className="flex justify-end">
          <ThemeSwitcher />
        </div>

        {/* Header with Warm / Luxury Branding */}
        <header className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-cafe-deep/90 border border-cafe-amber/50 rounded-2xl text-cafe-amber shadow-lg backdrop-blur-md">
            <Coffee className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#FFF4E6] tracking-tight drop-shadow-md">
            Zion Cafeteria: Digital Menu & Ordering System
          </h1>
          <p className="text-[#E8DCCB] text-sm sm:text-base font-serif italic tracking-wide max-w-xl mx-auto drop-shadow-sm">
            &ldquo;This is your home. Order what you like, it will be on the table.&rdquo;
          </p>
        </header>

        {/* 2-Column Dark Glassmorphism Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-5 w-full flex">
            <RealAuthForm />
          </div>

          <div className="lg:col-span-7 bg-cafe-deep/60 backdrop-blur-md border border-cafe-border/20 rounded-3xl p-6 shadow-2xl w-full flex flex-col justify-between">
            <DemoRoleShowcase />
          </div>
        </div>
      </div>

      <footer className="text-center text-[11px] text-[#C5B49F] py-4 mt-6">
        Zion Cafeteria • Full-Stack Hospitality Platform with Role-Based Security & Real-Time Live Ordering
      </footer>
    </div>
  );
};
