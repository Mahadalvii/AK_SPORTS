import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, Trash2, X } from 'lucide-react';

interface AdminAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemType: 'Product' | 'Variant' | 'Image';
  itemTitle: string;
  itemId?: string;
  adminEmail?: string;
}

export const AdminAuditModal: React.FC<AdminAuditModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemType,
  itemTitle,
  itemId,
  adminEmail,
}) => {
  const [confirmInput, setConfirmInput] = useState('');
  const timestamp = new Date().toISOString();

  if (!isOpen) return null;

  const requiresTyping = itemType === 'Product';
  const isConfirmEnabled = requiresTyping ? confirmInput.trim().toUpperCase() === 'DELETE' : true;

  const handleExecute = () => {
    if (!isConfirmEnabled) return;
    onConfirm();
    setConfirmInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl border border-rose-200 shadow-2xl overflow-hidden text-zinc-900">
        
        {/* Header */}
        <div className="bg-rose-50 border-b border-rose-200 p-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-rose-800">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h3 className="font-display font-bold text-base">
              Audit-Confirmed Deletion
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Permanent Action:</strong> This {itemType.toLowerCase()} will be permanently removed from the database and cannot be recovered.
            </div>
          </div>

          <div className="space-y-1.5 p-3 rounded-xl bg-zinc-50 border border-zinc-200">
            <div className="text-[11px] text-zinc-500 font-mono uppercase tracking-wider">Target Item:</div>
            <div className="font-bold text-sm text-zinc-900">{itemTitle}</div>
            {itemId && (
              <div className="font-mono text-[10px] text-zinc-500 truncate">ID: {itemId}</div>
            )}
            <div className="pt-2 border-t border-zinc-200 text-[10px] text-zinc-500 flex justify-between">
              <span>Admin: {adminEmail || 'Authorized Staff'}</span>
              <span>Time: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>

          {requiresTyping && (
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 block">
                Type <strong className="text-rose-700">DELETE</strong> to confirm permanent removal:
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 font-mono text-center tracking-widest text-xs uppercase focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-4 px-6 bg-zinc-50 border-t border-zinc-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-zinc-300 font-medium text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isConfirmEnabled}
            onClick={handleExecute}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-all shadow-sm cursor-pointer text-xs flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Confirm Permanent Deletion</span>
          </button>
        </div>

      </div>
    </div>
  );
};
