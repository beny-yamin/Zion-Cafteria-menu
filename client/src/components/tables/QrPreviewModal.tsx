import React from 'react';
import { X, Download, Printer } from 'lucide-react';
import { Table } from '../../types/index.js';

interface QrPreviewModalProps {
  table: Table | null;
  onClose: () => void;
  onDownload: (table: Table) => void;
}

export const QrPreviewModal: React.FC<QrPreviewModalProps> = ({ table, onClose, onDownload }) => {
  if (!table) return null;

  const isGeneral = table.type === 'general' || table.tableNumber === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cafe-deep/60 backdrop-blur-sm">
      <div className="bg-cafe-card text-cafe-text border border-cafe-border rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden transition-colors">
        <div className="px-5 py-4 border-b border-cafe-border flex items-center justify-between">
          <h3 className="font-bold text-sm text-cafe-text">QR Code Preview</h3>
          <button onClick={onClose} className="touch-target w-8 h-8 rounded-full flex items-center justify-center text-cafe-muted hover:text-cafe-text">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-cafe-amber">Zion Cafeteria</span>
            <h4 className="text-lg font-black text-cafe-text">
              {table.name || (isGeneral ? 'General Cafeteria' : `Table #${table.tableNumber}`)}
            </h4>
            <p className="text-xs text-cafe-muted font-mono">{table.targetUrl}</p>
          </div>

          <div className="p-4 bg-white rounded-2xl shadow-md border border-cafe-border/40">
            <img src={table.qrCodeUrl} alt={table.name} className="w-48 h-48 object-contain" />
          </div>

          <p className="text-[11px] text-cafe-muted">
            Customers scan with their phone camera to browse the digital menu and pay with Chapa.
          </p>

          <div className="w-full grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => onDownload(table)}
              className="touch-target py-2.5 bg-cafe-amber hover:bg-cafe-amber-hover text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>
            <button
              onClick={() => window.print()}
              className="touch-target py-2.5 bg-cafe-deep hover:bg-cafe-espresso text-[#FFF4E6] text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 shadow-sm border border-cafe-border/40"
            >
              <Printer className="w-3.5 h-3.5 text-cafe-amber" />
              <span>Print Card</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
