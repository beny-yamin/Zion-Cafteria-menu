import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  colorClass?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
}) => {
  return (
    <div className="bg-cafe-card rounded-2xl border border-cafe-border p-5 shadow-sm flex items-center justify-between transition-colors">
      <div>
        <p className="text-xs font-bold text-cafe-muted uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-black text-cafe-text mt-1">{value}</h3>
        {subtitle && <p className="text-[11px] text-cafe-muted mt-0.5">{subtitle}</p>}
      </div>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-cafe-cream text-cafe-amber border border-cafe-border">
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};
