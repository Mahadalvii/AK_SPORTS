import React from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Package, 
  XCircle, 
  MessageCircle, 
  Phone, 
  MapPin, 
  User, 
  Calendar,
  ExternalLink,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { AdminOrder, OrderStatus, formatWhatsAppUrl } from '../../lib/adminApi';

interface OrderDetailsModalProps {
  order: AdminOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  isUpdating?: boolean;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  isUpdating = false,
}) => {
  if (!isOpen || !order) return null;

  const whatsAppUrl = formatWhatsAppUrl(order);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending_cod':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/80 border border-amber-700/80 text-amber-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Approval (COD)</span>
          </span>
        );
      case 'processing':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-950/80 border border-sky-700/80 text-sky-300 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5" />
            <span>Processing / In Packing</span>
          </span>
        );
      case 'dispatched':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-950/80 border border-indigo-700/80 text-indigo-300 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5" />
            <span>Dispatched</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Delivered</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/80 border border-rose-800 text-rose-300 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelled</span>
          </span>
        );
    }
  };

  const formattedDate = new Date(order.created_at).toLocaleString('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#18181b] rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-start justify-between gap-4 bg-[#141416]">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xl font-extrabold text-[#d4af37]">
                #{order.id}
              </span>
              {getStatusBadge(order.status)}
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              <span>Placed on {formattedDate}</span>
              <span>·</span>
              <span className="font-mono uppercase font-bold text-zinc-300">Cash on Delivery</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Customer & Delivery Information Card */}
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
              <span className="font-bold uppercase tracking-wider text-[11px] text-[#d4af37]">
                Customer &amp; Shipping Details
              </span>
              
              {/* 1-Click WhatsApp Button */}
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Contact via WhatsApp</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-zinc-300">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-mono">Customer Name</span>
                  <span className="font-semibold text-white">{order.customer_name}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-mono">Contact Phone</span>
                  <span className="font-mono font-semibold text-white">{order.customer_phone}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:col-span-2">
                <MapPin className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-mono">Delivery Destination</span>
                  <span className="font-semibold text-white block">{order.customer_address}</span>
                  <span className="text-zinc-400 font-mono">City: {order.city}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line-by-Line Item Breakdown */}
          <div className="space-y-3">
            <span className="font-bold uppercase tracking-wider text-[11px] text-[#d4af37] block">
              Ordered Items Breakdown ({order.items.length})
            </span>

            <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/60 divide-y divide-zinc-800/80">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="font-bold text-white text-xs">{item.product_name}</div>
                    <div className="text-[11px] text-zinc-400 flex items-center gap-2">
                      {item.variant_title && (
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">
                          Size: {item.variant_title}
                        </span>
                      )}
                      <span className="font-mono">Qty: {item.quantity}</span>
                      <span>·</span>
                      <span className="font-mono">Rs. {item.unit_price.toLocaleString()} each</span>
                    </div>
                  </div>

                  <div className="font-mono font-bold text-white text-sm shrink-0">
                    Rs. {item.total_price.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
              <div className="flex justify-between text-zinc-400">
                <span>Items Subtotal:</span>
                <span className="font-mono text-zinc-200">Rs. {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Courier Delivery Fee:</span>
                <span className="font-mono text-zinc-200">
                  {order.delivery_fee === 0 ? 'FREE (Threshold Met)' : `Rs. ${order.delivery_fee.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-zinc-800">
                <span>Total Amount Due (COD):</span>
                <span className="font-mono text-[#d4af37]">Rs. {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Action Controls Bar */}
        <div className="p-4 border-t border-zinc-800 bg-[#141416] flex flex-wrap items-center justify-between gap-3">
          <div className="text-zinc-400 text-xs font-semibold">
            Change Order Workflow Status:
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {order.status === 'pending_cod' && (
              <>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onUpdateStatus(order.id, 'processing')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-sky-600 hover:bg-sky-500 text-white transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  Accept &amp; Process
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onUpdateStatus(order.id, 'dispatched')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  Direct Dispatch
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onUpdateStatus(order.id, 'cancelled')}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-rose-800 text-rose-300 hover:bg-rose-950 transition-all cursor-pointer disabled:opacity-50"
                >
                  Reject Order
                </button>
              </>
            )}

            {order.status === 'processing' && (
              <>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onUpdateStatus(order.id, 'dispatched')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  Dispatch Parcel
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onUpdateStatus(order.id, 'cancelled')}
                  className="px-3 py-2 rounded-xl text-xs font-semibold border border-rose-800 text-rose-300 hover:bg-rose-950 transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel Order
                </button>
              </>
            )}

            {order.status === 'dispatched' && (
              <>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onUpdateStatus(order.id, 'delivered')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  Mark as Delivered
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onUpdateStatus(order.id, 'cancelled')}
                  className="px-3 py-2 rounded-xl text-xs font-semibold border border-rose-800 text-rose-300 hover:bg-rose-950 transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel / Return
                </button>
              </>
            )}

            {order.status === 'cancelled' && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onUpdateStatus(order.id, 'pending_cod')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-all cursor-pointer disabled:opacity-50"
              >
                Restore to Pending
              </button>
            )}

            {order.status === 'delivered' && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Order Completed</span>
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
