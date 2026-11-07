import React from 'react';

interface OptionalCustomerFieldsProps {
  name: string;
  email: string;
  onNameChange: (val: string) => void;
  onEmailChange: (val: string) => void;
  disabled?: boolean;
}

export const OptionalCustomerFields: React.FC<OptionalCustomerFieldsProps> = ({
  name,
  email,
  onNameChange,
  onEmailChange,
  disabled,
}) => {
  return (
    <div className="space-y-3 pt-3 border-t border-cafe-border/60">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-cafe-muted mb-1 flex items-center justify-between">
            <span>Customer Name</span>
            <span className="text-[10px] text-cafe-amber font-semibold bg-cafe-amber/10 px-1.5 py-0.5 rounded">
              Optional
            </span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            disabled={disabled}
            placeholder="e.g. Almaz Ayana"
            className="w-full px-3 py-2 text-xs rounded-xl border border-cafe-border bg-cafe-cream text-cafe-text focus:outline-none focus:border-cafe-amber transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-cafe-muted mb-1 flex items-center justify-between">
            <span>Email Address</span>
            <span className="text-[10px] text-cafe-amber font-semibold bg-cafe-amber/10 px-1.5 py-0.5 rounded">
              Optional
            </span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            disabled={disabled}
            placeholder="e.g. almaz@example.com"
            className="w-full px-3 py-2 text-xs rounded-xl border border-cafe-border bg-cafe-cream text-cafe-text focus:outline-none focus:border-cafe-amber transition-colors"
          />
        </div>
      </div>
      <p className="text-[11px] text-cafe-muted leading-tight">
        Both fields are optional. Leave them blank to continue directly to Chapa payment.
      </p>
    </div>
  );
};
