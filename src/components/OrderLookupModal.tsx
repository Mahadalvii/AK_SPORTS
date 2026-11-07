import React, { useState } from 'react';
import { X, Search, PackageCheck, AlertCircle, Clock, Truck, CheckCircle2, ShieldCheck } from 'lucide-react';
import { ThemeConfig } from '../types';
import { lookupOrder, OrderLookupResult } from '../lib/supabase';

interface OrderLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeConfig;
}

export const OrderLookupModal: React.FC<OrderLookupModalProps> = ({
  isOpen,
  onClose,
  theme,
}) => {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OrderLookupResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setResult(null);

    const cleanOrderId = orderId.trim();
    const cleanPhone = phone.trim();

    if (!cleanOrderId) {
      setErrorMessage('Please enter your Order ID (e.g. AK-7F3K9Q).');
      return;
    }
    if (!cleanPhone) {
      setErrorMessage('Please enter the phone number associated with the order.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await lookupOrder(cleanOrderId, cleanPhone);
      if (!res.found) {
        setErrorMessage(res.error || 'No order found matching this Order ID and Phone Number.');
      } else {
        setResult(res);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to retrieve order details.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'pending_cod':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>Order Placed (Pending COD Dispatch)</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Confirmed by Sialkot Workshop</span>
          </span>
        );
      case 'dispatched':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Truck className="w-3.5 h-3.5" />
            <span>Dispatched via Courier</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Delivered</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
            <span>Processing</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.border,
          color: theme.textPrimary,
        }}
      >
        {/* Modal Header */}
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg" style={{ backgroundColor: theme.badgeBg }}>
              <Search className="w-4 h-4" style={{ color: theme.accent }} />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg">Track Your Order</h3>
              <p className="text-[11px] text-zinc-500">Real-time status direct from our Sialkot database</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close track order modal"
            className="p-1.5 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Lookup Input Form */}
          <form onSubmit={handleLookup} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold block text-zinc-700">Order ID</label>
              <input
                type="text"
                placeholder="e.g. AK-7F3K9Q"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono uppercase rounded-xl border outline-none transition-colors"
                style={{
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                  color: theme.textPrimary,
                }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold block text-zinc-700">Phone Number (Order Verification)</label>
              <input
                type="tel"
                placeholder="03XX-XXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border outline-none transition-colors"
                style={{
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                  color: theme.textPrimary,
                }}
              />
              <p className="text-[10px] text-zinc-400">
                Both Order ID and matching phone number are required to protect customer privacy.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer shadow-xs flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-50"
              style={{
                backgroundColor: theme.accent,
                color: theme.accentText,
              }}
            >
              {isLoading ? (
                <span>Checking Database...</span>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Look Up Order</span>
                </>
              )}
            </button>
          </form>

          {/* Results Box */}
          {result && result.found && (
            <div className="p-4 sm:p-5 rounded-xl border space-y-4" style={{ backgroundColor: theme.bg, borderColor: theme.border }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b" style={{ borderColor: theme.border }}>
                <div>
                  <span className="text-[10px] uppercase font-mono text-zinc-400 block">Verified Order ID</span>
                  <span className="font-mono font-bold text-base text-zinc-900">{result.order_id}</span>
                </div>
                <div>{getStatusBadge(result.status)}</div>
              </div>

              {result.created_at && (
                <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Placed on: {new Date(result.created_at).toLocaleString()}</span>
                </div>
              )}

              {/* Items in order */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-800 block">Items in Parcel:</span>
                <div className="space-y-2">
                  {result.items && result.items.length > 0 ? (
                    result.items.map((it, idx) => (
                      <div 
                        key={idx}
                        className="p-2.5 rounded-lg border flex items-center justify-between text-xs"
                        style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-zinc-900 truncate">{it.product_name}</p>
                          {it.variant_title && (
                            <span className="text-[10px] text-zinc-500 block">{it.variant_title}</span>
                          )}
                          <span className="text-[11px] text-zinc-400">Qty: {it.quantity}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-zinc-900">
                            Rs. {it.total_price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-500">Item details secured.</p>
                  )}
                </div>
              </div>

              {/* Order financial totals */}
              <div className="pt-3 border-t text-xs space-y-1" style={{ borderColor: theme.border }}>
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span className="font-mono">Rs. {result.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Courier Delivery</span>
                  <span className="font-mono">
                    {result.delivery_fee === 0 ? 'FREE' : `Rs. ${result.delivery_fee}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-zinc-900 pt-1 border-t" style={{ borderColor: theme.border }}>
                  <span>Total Payable (Cash on Delivery)</span>
                  <span className="font-mono text-[#b89428] text-sm">
                    Rs. {result.total?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Privacy badge */}
              <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-[10px] text-emerald-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Customer privacy guaranteed: Recipient name and street address are never exposed publicly.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
