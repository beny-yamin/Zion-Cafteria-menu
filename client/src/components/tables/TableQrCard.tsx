import React from 'react';
import { Eye, Download, RefreshCw, Power, Trash2 } from 'lucide-react';
import { Table } from '../../types/index.js';

interface TableQrCardProps {
  table: Table;
  onPreview: (table: Table) => void;
  onDownload: (table: Table) => void;
  onRegenerate: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  isActionLoading: boolean;
}

export const TableQrCard: React.FC<TableQrCardProps> = ({
  table,
  onPreview,
  onDownload,
  onRegenerate,
  onToggleStatus,
  onDelete,
  isActionLoading,
}) => {
  const isGeneral = table.type === 'general' || table.tableNumber === 0;
  const isActive = table.status !== 'deactivated';

  return (
    <div
      className={`bg-cafe-card rounded-2xl border p-4 shadow-sm flex flex-col justify-between transition-all print:border-2 ${
        isActive ? 'border-cafe-border' : 'border-cafe-border/50 opacity-60 bg-cafe-cream/40'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-black uppercase text-cafe-text bg-cafe-cream border border-cafe-border px-2 py-0.5 rounded-full truncate">
            {isGeneral ? 'General' : `Table #${table.tableNumber}`}
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              isActive ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-[#4B3024]/10 text-[#4B3024] border border-[#4B3024]/20'
            }`}
          >
            {isActive ? 'Active' : 'Deactivated'}
          </span>
        </div>
        <h4 className="font-bold text-xs text-cafe-text truncate" title={table.name}>
          {table.name || (isGeneral ? 'General Cafeteria' : `Table ${table.tableNumber}`)}
        </h4>
      </div>

      <div className="my-3 flex flex-col items-center cursor-pointer" onClick={() => onPreview(table)}>
        <img
          src={table.qrCodeUrl}
          alt={table.name}
          className="w-32 h-32 object-contain bg-white p-1 rounded-xl shadow-inner border border-cafe-border/30 hover:scale-105 transition-transform"
        />
        <p className="text-[10px] text-cafe-muted mt-1 font-mono truncate max-w-[140px]">
          {table.targetUrl || (table.qrToken ? `/menu/${table.qrToken}` : '/menu')}
        </p>
      </div>

      <div className="pt-2 border-t border-cafe-border/60 flex items-center justify-between gap-1 print:hidden">
        <button
          onClick={() => onPreview(table)}
          className="touch-target p-1.5 rounded-lg text-cafe-muted hover:text-cafe-text hover:bg-cafe-cream"
          title="Preview QR"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDownload(table)}
          className="touch-target p-1.5 rounded-lg text-cafe-muted hover:text-cafe-amber hover:bg-cafe-cream"
          title="Download PNG"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={() => onRegenerate(table._id)}
          disabled={isActionLoading}
          className="touch-target p-1.5 rounded-lg text-cafe-muted hover:text-cafe-amber hover:bg-cafe-cream disabled:opacity-50"
          title="Regenerate QR"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={() => onToggleStatus(table._id)}
          disabled={isActionLoading}
          className={`touch-target p-1.5 rounded-lg ${
            isActive ? 'text-emerald-600 hover:text-[#4B3024]' : 'text-cafe-muted hover:text-emerald-600'
          } hover:bg-cafe-cream disabled:opacity-50`}
          title={isActive ? 'Deactivate' : 'Activate'}
        >
          <Power className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(table._id)}
          disabled={isActionLoading}
          className="touch-target p-1.5 rounded-lg text-cafe-muted hover:text-[#4B3024] hover:bg-cafe-cream disabled:opacity-50"
          title="Delete QR"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
