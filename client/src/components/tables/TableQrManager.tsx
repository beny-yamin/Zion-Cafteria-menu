import React, { useState } from 'react';
import { RefreshCw, Printer, Plus, QrCode } from 'lucide-react';
import { api } from '../../lib/api.js';
import { Table, QrType } from '../../types/index.js';
import { TableQrCard } from './TableQrCard.js';
import { CreateQrModal } from './CreateQrModal.js';
import { QrPreviewModal } from './QrPreviewModal.js';

interface TableQrManagerProps {
  tables: Table[];
  onTablesUpdated: () => void;
}

export const TableQrManager: React.FC<TableQrManagerProps> = ({ tables, onTablesUpdated }) => {
  const [totalCount, setTotalCount] = useState('8');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [previewTable, setPreviewTable] = useState<Table | null>(null);

  const handleBatchGenerate = async () => {
    setIsGenerating(true);
    try {
      await api.post('/tables/generate', { totalTables: Number(totalCount) || 8 });
      onTablesUpdated();
    } catch (err) { console.error('Batch generation failed:', err); }
    finally { setIsGenerating(false); }
  };

  const handleCreateQr = async (name: string, type: QrType, tableNumber: number) => {
    setIsActionLoading(true);
    try {
      await api.post('/tables/create', { name, type, tableNumber });
      setIsCreateModalOpen(false);
      onTablesUpdated();
    } catch (err) { console.error('Failed to create QR:', err); }
    finally { setIsActionLoading(false); }
  };

  const handleToggleStatus = async (id: string) => {
    setIsActionLoading(true);
    try {
      await api.patch(`/tables/${id}/toggle-status`);
      onTablesUpdated();
    } catch (err) { console.error('Failed to toggle status:', err); }
    finally { setIsActionLoading(false); }
  };

  const handleRegenerate = async (id: string) => {
    setIsActionLoading(true);
    try {
      await api.patch(`/tables/${id}/regenerate`);
      onTablesUpdated();
    } catch (err) { console.error('Failed to regenerate QR:', err); }
    finally { setIsActionLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this QR code?')) return;
    setIsActionLoading(true);
    try {
      await api.delete(`/tables/${id}`);
      onTablesUpdated();
    } catch (err) { console.error('Failed to delete QR:', err); }
    finally { setIsActionLoading(false); }
  };

  const handleDownload = (table: Table) => {
    const link = document.createElement('a');
    link.href = table.qrCodeUrl;
    link.download = `zion-qr-${table.type === 'general' ? 'general' : `table-${table.tableNumber}`}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 transition-colors">
      <div className="bg-cafe-card rounded-2xl border border-cafe-border p-5 shadow-sm flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h3 className="font-bold text-cafe-text text-sm flex items-center space-x-2">
            <QrCode className="w-4 h-4 text-cafe-amber" />
            <span>In-Dashboard QR Fleet Manager</span>
          </h3>
          <p className="text-xs text-cafe-muted">Generate, download, print tent cards, or deactivate table & general cafeteria QRs.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button onClick={() => setIsCreateModalOpen(true)} className="touch-target px-3 py-2 bg-cafe-amber hover:bg-cafe-amber-hover text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-sm">
            <Plus className="w-3.5 h-3.5" /><span>New QR Code</span>
          </button>
          <div className="flex items-center space-x-1 bg-cafe-cream border border-cafe-border rounded-xl px-2 py-1">
            <input type="number" min="1" max="100" value={totalCount} onChange={(e) => setTotalCount(e.target.value)} className="w-12 bg-transparent text-xs font-bold text-cafe-text text-center focus:outline-none" />
            <button onClick={handleBatchGenerate} disabled={isGenerating} className="px-2 py-1 bg-cafe-card hover:bg-cafe-border text-cafe-text text-[11px] font-bold rounded-lg flex items-center space-x-1 border border-cafe-border">
              <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} /><span>Batch Fleet</span>
            </button>
          </div>
          <button onClick={() => window.print()} className="touch-target px-3 py-2 bg-cafe-deep hover:bg-cafe-espresso text-[#FFF4E6] text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-sm">
            <Printer className="w-3.5 h-3.5 text-cafe-amber" /><span>Print Tent Cards</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 print:grid-cols-2">
        {tables.map((table) => (
          <TableQrCard key={table._id} table={table} onPreview={setPreviewTable} onDownload={handleDownload} onRegenerate={handleRegenerate} onToggleStatus={handleToggleStatus} onDelete={handleDelete} isActionLoading={isActionLoading} />
        ))}
      </div>

      <CreateQrModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreateQr} isSubmitting={isActionLoading} />
      <QrPreviewModal table={previewTable} onClose={() => setPreviewTable(null)} onDownload={handleDownload} />
    </div>
  );
};
