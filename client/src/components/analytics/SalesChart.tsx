import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useTheme } from '../../context/ThemeContext.js';

interface SalesChartProps {
  data: Array<{ name: string; totalSales: number; totalQuantity: number }>;
}

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  const { theme, preset } = useTheme();

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-cafe-muted text-xs font-semibold">
        No sales recorded in this period yet.
      </div>
    );
  }

  const barColor = preset.palette.primary;
  const gridColor = theme === 'luxury' ? '#D8CEBE' : '#EADBCE';
  const textColor = theme === 'luxury' ? '#706760' : '#88796A';
  const cardBg = theme === 'luxury' ? '#FAF6EE' : '#FFFDF8';

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: textColor }} interval={0} angle={-15} textAnchor="end" />
          <YAxis tick={{ fontSize: 11, fill: textColor }} />
          <Tooltip
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
            contentStyle={{ borderRadius: '0.75rem', border: `1px solid ${gridColor}`, backgroundColor: cardBg, color: textColor, fontSize: '12px' }}
          />
          <Bar dataKey="totalSales" fill={barColor} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
