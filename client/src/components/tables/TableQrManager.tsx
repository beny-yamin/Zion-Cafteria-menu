import React, { useState } from 'react';
import { RefreshCw, Printer } from 'lucide-react';
import { api } from '../../lib/api.js';
import { Table } from '../../types/index.js';

interface TableQrManagerProps {
  tables: Table[];
  onTablesUpdated: () => void;
}

export const TableQrManager: React.FC<TableQrManagerProps> = ({ tables, onTablesUpdated }) => {
  const [totalCount, setTotalCount] = useState('8');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await api.post('/tables/generate', { totalTables: Number(totalCount) || 8 });
      onTablesUpdated();
    } catch (err) {
      console.error('Failed to generate tables:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 transition-colors">
      <div className="bg-cafe-card rounded-2xl border border-cafe-border p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-cafe-text text-sm">Table QR Code Fleet</h3>
          <p className="text-xs text-cafe-muted">Scan redirects customers directly to /menu?table=N</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-cafe-muted font-semibold">Tables:</span>
            <input
              type="number"
              min="1"
              max="100"
              value={totalCount}
              onChange={(e) => setTotalCount(e.target.value)}
              className="w-16 px-2.5 py-1.5 border border-cafe-border bg-cafe-cream rounded-lg text-xs font-bold text-cafe-text text-center focus:outline-none focus:border-cafe-amber"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="touch-target px-3.5 py-2 bg-cafe-amber hover:bg-cafe-amber-hover text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Generate Codes</span>
          </button>

          <button
            onClick={handlePrint}
            className="touch-target px-3.5 py-2 bg-cafe-deep hover:bg-cafe-espresso text-[#FFF4E6] text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-cafe-amber" />
            <span>Print Tent Cards</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 print:grid-cols-2">
        {tables.map((table) => (
          <div
            key={table._id}
            className="bg-cafe-card rounded-2xl border border-cafe-border p-4 text-center shadow-sm flex flex-col items-center justify-between print:break-inside-avoid print:border-2"
          >
            <span className="text-xs font-black uppercase text-cafe-text bg-cafe-cream border border-cafe-border px-2.5 py-1 rounded-full mb-3">
              Table #{table.tableNumber}
            </span>
            <img
              src={table.qrCodeUrl}
              alt={`QR Code Table ${table.tableNumber}`}
              className="w-36 h-36 object-contain my-1"
            />
            <p className="text-[10px] text-cafe-muted font-bold mt-2">
              Scan to order with phone
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
