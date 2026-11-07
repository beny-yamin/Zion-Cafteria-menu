import React, { useState } from 'react';
import { X, QrCode, Plus } from 'lucide-react';
import { QrType } from '../../types/index.js';

interface CreateQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, type: QrType, tableNumber: number) => Promise<void>;
  isSubmitting: boolean;
}

export const CreateQrModal: React.FC<CreateQrModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [type, setType] = useState<QrType>('table');
  const [tableNumber, setTableNumber] = useState('1');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name.trim(), type, type === 'general' ? 0 : Number(tableNumber) || 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cafe-deep/60 backdrop-blur-sm">
      <div className="bg-cafe-card text-cafe-text border border-cafe-border rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden transition-colors">
        <div className="px-5 py-4 border-b border-cafe-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-cafe-amber" />
            <h3 className="font-bold text-sm text-cafe-text">Create New QR Code</h3>
          </div>
          <button onClick={onClose} className="touch-target w-8 h-8 rounded-full flex items-center justify-center text-cafe-muted hover:text-cafe-text">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-cafe-muted mb-1.5">QR Code Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('table')}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  type === 'table' ? 'border-cafe-amber bg-cafe-amber/10 text-cafe-amber' : 'border-cafe-border bg-cafe-cream text-cafe-muted'
                }`}
              >
                Table Specific
              </button>
              <button
                type="button"
                onClick={() => setType('general')}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  type === 'general' ? 'border-cafe-amber bg-cafe-amber/10 text-cafe-amber' : 'border-cafe-border bg-cafe-cream text-cafe-muted'
                }`}
              >
                General Cafeteria
              </button>
            </div>
          </div>

          {type === 'table' && (
            <div>
              <label className="block text-xs font-bold text-cafe-muted mb-1">Table Number</label>
              <input
                type="number"
                min="1"
                max="200"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-cafe-border bg-cafe-cream text-cafe-text focus:outline-none focus:border-cafe-amber"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-cafe-muted mb-1">Custom Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'table' ? 'e.g. Window Booth #1' : 'e.g. Main Cashier Counter'}
              className="w-full px-3 py-2 text-xs rounded-xl border border-cafe-border bg-cafe-cream text-cafe-text focus:outline-none focus:border-cafe-amber"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full touch-target py-3 bg-cafe-amber hover:bg-cafe-amber-hover text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 shadow-md disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Generate & Save QR</span>
          </button>
        </form>
      </div>
    </div>
  );
};
