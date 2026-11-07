import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MessageCircle, 
  ExternalLink, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Truck, 
  Package, 
  RefreshCw, 
  AlertCircle,
  Phone,
  MapPin,
  Calendar,
  Filter
} from 'lucide-react';
import { AdminOrder, OrderStatus, formatWhatsAppUrl } from '../../lib/adminApi';

interface OrderListProps {
  orders: AdminOrder[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelectOrder: (order: AdminOrder) => void;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  updatingOrderId?: string | null;
}

type FilterTab = 'all' | 'pending_cod' | 'processing_dispatched' | 'delivered' | 'cancelled';

export const OrderList: React.FC<OrderListProps> = ({
  orders,
  isLoading,
  onRefresh,
  onSelectOrder,
  onUpdateStatus,
  updatingOrderId,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectConfirmId, setRejectConfirmId] = useState<string | null>(null);

  // Counts for badge
  const counts = useMemo(() => {
    return {
      all: orders.length,
      pending_cod: orders.filter((o) => o.status === 'pending_cod').length,
      processing_dispatched: orders.filter((o) => o.status === 'processing' || o.status === 'dispatched').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
    };
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Tab filter
      if (activeFilter === 'pending_cod' && order.status !== 'pending_cod') return false;
      if (activeFilter === 'processing_dispatched' && order.status !== 'processing' && order.status !== 'dispatched') return false;
      if (activeFilter === 'delivered' && order.status !== 'delivered') return false;
      if (activeFilter === 'cancelled' && order.status !== 'cancelled') return false;

      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesId = order.id.toLowerCase().includes(query);
        const matchesName = order.customer_name.toLowerCase().includes(query);
        const matchesPhone = order.customer_phone.toLowerCase().includes(query);
        const matchesCity = order.city.toLowerCase().includes(query);
        const matchesItems = order.items.some((item) =>
          item.product_name.toLowerCase().includes(query) ||
          item.variant_title.toLowerCase().includes(query)
        );
        return matchesId || matchesName || matchesPhone || matchesCity || matchesItems;
      }

      return true;
    });
  }, [orders, activeFilter, searchTerm]);

  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending_cod':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 border border-amber-700/80 text-amber-300">
            <Clock className="w-3.5 h-3.5" />
            Pending Approval (COD)
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-950/80 border border-sky-700/80 text-sky-300">
            <Package className="w-3.5 h-3.5" />
            Processing
          </span>
        );
      case 'dispatched':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-950/80 border border-indigo-700/80 text-indigo-300">
            <Truck className="w-3.5 h-3.5" />
            Dispatched
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-700/80 text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/80 border border-rose-700/80 text-rose-300">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-800 border border-zinc-700 text-zinc-300">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-PK', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Controls Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-zinc-900/90 p-1.5 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeFilter === 'all'
                ? 'bg-[#d4af37] text-zinc-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <span>All Orders</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              activeFilter === 'all' ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-zinc-300'
            }`}>
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('pending_cod')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeFilter === 'pending_cod'
                ? 'bg-amber-500 text-zinc-950 shadow-md font-bold'
                : 'text-amber-400 hover:text-amber-300 hover:bg-amber-950/30'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Approval (COD)</span>
            {counts.pending_cod > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeFilter === 'pending_cod' ? 'bg-zinc-950 text-amber-300' : 'bg-amber-500 text-zinc-950 animate-pulse'
              }`}>
                {counts.pending_cod}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveFilter('processing_dispatched')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeFilter === 'processing_dispatched'
                ? 'bg-sky-500 text-zinc-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Processing / Dispatched</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              activeFilter === 'processing_dispatched' ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-zinc-300'
            }`}>
              {counts.processing_dispatched}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('delivered')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeFilter === 'delivered'
                ? 'bg-emerald-500 text-zinc-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Delivered</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              activeFilter === 'delivered' ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-zinc-300'
            }`}>
              {counts.delivered}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('cancelled')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeFilter === 'cancelled'
                ? 'bg-rose-500 text-zinc-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelled</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              activeFilter === 'cancelled' ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-zinc-300'
            }`}>
              {counts.cancelled}
            </span>
          </button>
        </div>

        {/* Search Bar & Refresh */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by ID, name, phone, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#d4af37]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Orders Table & Cards */}
      {filteredOrders.length === 0 ? (
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-12 text-center">
          <Package className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-zinc-300">No orders found</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-md mx-auto">
            {searchTerm
              ? `No orders matching "${searchTerm}". Try a different search term or clear the filter.`
              : 'There are currently no orders in this status category.'}
          </p>
        </div>
      ) : (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase tracking-wider text-zinc-400">
                  <th className="py-3.5 px-4 font-semibold">Order ID & Date</th>
                  <th className="py-3.5 px-4 font-semibold">Customer Details</th>
                  <th className="py-3.5 px-4 font-semibold">Items</th>
                  <th className="py-3.5 px-4 font-semibold">Total (COD)</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-sm">
                {filteredOrders.map((order) => {
                  const whatsAppUrl = formatWhatsAppUrl(order);
                  const isPending = order.status === 'pending_cod';
                  const isProcessing = order.status === 'processing';
                  const isDispatched = order.status === 'dispatched';
                  const isDelivered = order.status === 'delivered';
                  const isCancelled = order.status === 'cancelled';
                  const isThisUpdating = updatingOrderId === order.id;

                  return (
                    <tr 
                      key={order.id} 
                      className="hover:bg-zinc-800/30 transition-colors group"
                    >
                      {/* Order ID & Date */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-mono font-semibold text-[#d4af37] text-sm">
                          {order.id}
                        </div>
                        <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-600" />
                          <span>{formatDate(order.created_at)}</span>
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-1 uppercase tracking-wider">
                          COD • Free Delivery
                        </div>
                      </td>

                      {/* Customer Details */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-medium text-zinc-200">
                          {order.customer_name}
                        </div>
                        <div className="text-xs text-zinc-400 mt-1 flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-zinc-500" />
                          <span>{order.customer_phone}</span>
                        </div>
                        <div className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                          <span className="truncate max-w-[200px]" title={`${order.customer_address}, ${order.city}`}>
                            {order.city}
                          </span>
                        </div>
                      </td>

                      {/* Items Breakdown */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1">
                          {order.items.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="text-xs text-zinc-300">
                              <span className="font-semibold text-zinc-100">{item.quantity}x</span>{' '}
                              <span>{item.product_name}</span>{' '}
                              <span className="text-zinc-500">({item.variant_title})</span>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div className="text-[11px] text-[#d4af37] font-medium">
                              +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
                            </div>
                          )}
                          {order.items.length === 0 && (
                            <span className="text-xs text-zinc-500 italic">No item details</span>
                          )}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-bold text-zinc-100 text-sm">
                          Rs. {order.total.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          {order.items.reduce((acc, i) => acc + i.quantity, 0)} item(s) total
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 align-top">
                        {renderStatusBadge(order.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* 1-Click WhatsApp Direct Contact */}
                          <a
                            href={whatsAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-emerald-950/70 border border-emerald-700/80 hover:bg-emerald-900 text-emerald-300 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                            title="Chat with Customer on WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4 text-emerald-400" />
                            <span className="hidden xl:inline">WhatsApp</span>
                          </a>

                          {/* Quick Accept Button for Pending Orders */}
                          {isPending && (
                            <button
                              onClick={() => onUpdateStatus(order.id, 'processing')}
                              disabled={isThisUpdating}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm disabled:opacity-50"
                              title="Accept Order & Move to Processing"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Accept</span>
                            </button>
                          )}

                          {/* Quick Dispatch Button for Processing Orders */}
                          {isProcessing && (
                            <button
                              onClick={() => onUpdateStatus(order.id, 'dispatched')}
                              disabled={isThisUpdating}
                              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm disabled:opacity-50"
                              title="Dispatch Order"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Dispatch</span>
                            </button>
                          )}

                          {/* Quick Deliver Button for Dispatched Orders */}
                          {isDispatched && (
                            <button
                              onClick={() => onUpdateStatus(order.id, 'delivered')}
                              disabled={isThisUpdating}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm disabled:opacity-50"
                              title="Mark as Delivered"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Deliver</span>
                            </button>
                          )}

                          {/* Quick Reject Button (if not already cancelled/delivered) */}
                          {!isCancelled && !isDelivered && (
                            rejectConfirmId === order.id ? (
                              <div className="flex items-center gap-1 bg-rose-950/90 border border-rose-700 px-2 py-1 rounded-lg">
                                <span className="text-[11px] text-rose-300">Confirm cancel?</span>
                                <button
                                  onClick={() => {
                                    onUpdateStatus(order.id, 'cancelled');
                                    setRejectConfirmId(null);
                                  }}
                                  disabled={isThisUpdating}
                                  className="text-[11px] font-bold text-rose-200 underline hover:text-white"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setRejectConfirmId(null)}
                                  className="text-[11px] text-zinc-400 hover:text-zinc-200 ml-1"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setRejectConfirmId(order.id)}
                                disabled={isThisUpdating}
                                className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-rose-800 hover:text-rose-400 text-zinc-400 rounded-lg transition-colors text-xs"
                                title="Reject / Cancel Order"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )
                          )}

                          {/* View Full Order Details Modal */}
                          <button
                            onClick={() => onSelectOrder(order)}
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors text-xs flex items-center gap-1"
                            title="View Full Order Details"
                          >
                            <Eye className="w-4 h-4 text-zinc-400 group-hover:text-[#d4af37]" />
                            <span className="hidden md:inline">Details</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer Summary */}
          <div className="px-4 py-3 bg-zinc-900/80 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <div>
              Showing <span className="font-semibold text-zinc-200">{filteredOrders.length}</span> of{' '}
              <span className="font-semibold text-zinc-200">{orders.length}</span> total orders
            </div>
            <div className="flex items-center gap-4">
              <span>COD Payments Only</span>
              <span className="text-[#d4af37] font-semibold">
                Total Value: Rs.{' '}
                {filteredOrders
                  .filter((o) => o.status !== 'cancelled')
                  .reduce((sum, o) => sum + o.total, 0)
                  .toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
