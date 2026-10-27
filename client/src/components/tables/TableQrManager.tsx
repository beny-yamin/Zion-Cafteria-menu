import React, { useState } from 'react';
import { QrCode, RefreshCw, Printer } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Table QR Code Fleet</h3>
          <p className="text-xs text-gray-500">Scan redirects customers directly to /menu?table=N</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Tables:</span>
            <input
              type="number"
              min="1"
              max="100"
              value={totalCount}
              onChange={(e) => setTotalCount(e.target.value)}
              className="w-16 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-center"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="touch-target px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Generate Codes</span>
          </button>

          <button
            onClick={handlePrint}
            className="touch-target px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Tent Cards</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 print:grid-cols-2">
        {tables.map((table) => (
          <div
            key={table._id}
            className="bg-white rounded-2xl border border-gray-200 p-4 text-center shadow-sm flex flex-col items-center justify-between print:break-inside-avoid print:border-2"
          >
            <span className="text-xs font-black uppercase text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full mb-3">
              Table #{table.tableNumber}
            </span>
            <img
              src={table.qrCodeUrl}
              alt={`QR Code Table ${table.tableNumber}`}
              className="w-36 h-36 object-contain my-1"
            />
            <p className="text-[10px] text-gray-400 font-medium mt-2">
              Scan to order with phone
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
