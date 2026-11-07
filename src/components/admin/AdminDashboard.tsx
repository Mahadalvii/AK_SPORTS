import React, { useState, useEffect } from 'react';
import { 
  AdminProduct, 
  AdminOrder,
  OrderStatus,
  verifyAdminStatus, 
  getAdminProducts, 
  saveAdminProduct, 
  toggleProductActive, 
  deleteAdminProduct, 
  deleteAdminVariant,
  getAdminOrders,
  updateOrderStatus
} from '../../lib/adminApi';
import { AdminLogin } from './AdminLogin';
import { ProductList } from './ProductList';
import { ProductForm } from './ProductForm';
import { OrderList } from './OrderList';
import { OrderDetailsModal } from './OrderDetailsModal';
import { AdminAuditModal } from './AdminAuditModal';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { 
  ShieldCheck, 
  LogOut, 
  ArrowLeft, 
  Package, 
  ShoppingBag,
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Clock
} from 'lucide-react';

interface AdminDashboardProps {
  onExitToStore: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExitToStore }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(true);

  // Top Nav Tab: 'products' | 'orders'
  const [activeNavTab, setActiveNavTab] = useState<'products' | 'orders'>('products');

  // Product View state
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);

  // Products data state
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);

  // Orders data state
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Notifications
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Audit Deletion Modal State
  const [auditModal, setAuditModal] = useState<{
    isOpen: boolean;
    itemType: 'Product' | 'Variant' | 'Image';
    itemTitle: string;
    itemId?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    itemType: 'Product',
    itemTitle: '',
    onConfirm: () => {},
  });

  // Check authentication & admin role on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsVerifying(true);
    const status = await verifyAdminStatus();
    setIsAuthenticated(status.isAuthenticated);
    setIsAdmin(status.isAdmin);
    if (status.email) {
      setAdminEmail(status.email);
    }
    setIsVerifying(false);

    if (status.isAdmin) {
      loadProducts();
      loadOrders();
    }
  };

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    const data = await getAdminProducts();
    setProducts(data);
    setIsLoadingProducts(false);
  };

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    const orderData = await getAdminOrders();
    setOrders(orderData);
    setIsLoadingOrders(false);
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleLoginSuccess = (email: string) => {
    setIsAuthenticated(true);
    setIsAdmin(true);
    setAdminEmail(email);
    loadProducts();
    loadOrders();
  };

  const handleSignOut = async () => {
    // Security Rule 5: Clear session and redirect to login page
    try {
      if (isSupabaseConfigured() && supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('[AK Sports Admin] Error during sign out:', err);
    }
    localStorage.removeItem('ak_sports_admin_mock_session');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setAdminEmail('');
    setView('list');
    setEditingProduct(null);
    setSelectedOrder(null);
    showToast('Signed out successfully.');
  };

  // Toggle is_active
  const handleToggleActive = async (productId: string, currentActive: boolean) => {
    const nextState = !currentActive;
    const res = await toggleProductActive(productId, nextState);
    if (res.success) {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, is_active: nextState } : p));
      showToast(`Product is now ${nextState ? 'Active on store' : 'Hidden from store'}.`);
    } else {
      showToast(res.error || 'Failed to update product status.', 'error');
    }
  };

  // Delete product request (Rule 8: Audit modal)
  const handleDeleteProductRequest = (prod: AdminProduct) => {
    setAuditModal({
      isOpen: true,
      itemType: 'Product',
      itemTitle: prod.name,
      itemId: prod.id,
      onConfirm: async () => {
        const res = await deleteAdminProduct(prod.id);
        if (res.success) {
          setProducts(prev => prev.filter(p => p.id !== prod.id));
          showToast(`Permanently deleted product "${prod.name}".`);
        } else {
          showToast(res.error || 'Failed to delete product.', 'error');
        }
        setAuditModal(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Delete variant request (Rule 8: Audit modal)
  const handleDeleteVariantRequest = (variantTitle: string, index: number) => {
    setAuditModal({
      isOpen: true,
      itemType: 'Variant',
      itemTitle: `Variant: ${variantTitle}`,
      onConfirm: () => {
        if (editingProduct) {
          const varToDelete = editingProduct.variants[index];
          if (varToDelete?.id && !varToDelete.id.startsWith('temp-')) {
            deleteAdminVariant(varToDelete.id);
          }
        }
        showToast(`Variant "${variantTitle}" removed.`);
        setAuditModal(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Save product from form
  const handleSaveProduct = async (productData: AdminProduct): Promise<{ success: boolean; error?: string }> => {
    const result = await saveAdminProduct(productData);
    if (result.success) {
      showToast(`Successfully saved product "${productData.name}".`);
      await loadProducts();
      setView('list');
      setEditingProduct(null);
    }
    return result;
  };

  // Handle Order Status Update (Approve / Dispatch / Deliver / Reject)
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    const result = await updateOrderStatus(orderId, newStatus);
    setUpdatingOrderId(null);

    if (result.success) {
      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }

      const statusLabels: Record<OrderStatus, string> = {
        pending_cod: 'Pending COD',
        processing: 'Accepted & Processing',
        dispatched: 'Dispatched',
        delivered: 'Delivered',
        cancelled: 'Cancelled / Rejected',
      };
      showToast(`Order #${orderId} marked as ${statusLabels[newStatus]}.`);
    } else {
      showToast(result.error || 'Failed to update order status.', 'error');
    }
  };

  // Calculate pending orders count for badge
  const pendingOrdersCount = orders.filter(o => o.status === 'pending_cod').length;

  // If still checking session
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#121214] flex items-center justify-center text-zinc-400 text-xs">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#d4af37]" />
          <span>Verifying administrator permissions...</span>
        </div>
      </div>
    );
  }

  // If not authenticated or not in public.admins
  if (!isAuthenticated || !isAdmin) {
    return (
      <AdminLogin 
        onSuccess={handleLoginSuccess}
        onExitToStore={onExitToStore}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#121214] text-white flex flex-col font-sans antialiased selection:bg-[#d4af37]/30 selection:text-white">
      
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-40 bg-[#18181b]/95 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Admin Badge */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-black border border-[#d4af37] overflow-hidden flex items-center justify-center shrink-0 p-0.5">
              <img
                src="/images/ak_sports_logo_centered.png"
                alt="AK Sports Crest"
                className="w-full h-full object-contain object-center"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-sm tracking-wide text-white">
                  AK SPORTS
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Admin Portal</span>
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono truncate max-w-[200px] sm:max-w-none">
                {adminEmail} · Verified in public.admins
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onExitToStore}
              className="px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Storefront</span>
            </button>

            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950/80 hover:text-rose-300 border border-zinc-700 hover:border-rose-800 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>

        </div>

        {/* Secondary Navigation Bar: Products vs Orders */}
        <div className="border-t border-zinc-800/80 bg-zinc-900/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 py-2">
            
            {/* Products Tab */}
            <button
              onClick={() => setActiveNavTab('products')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeNavTab === 'products'
                  ? 'bg-[#d4af37] text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/70'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Products Catalog</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeNavTab === 'products' ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {products.length}
              </span>
            </button>

            {/* Orders Tab */}
            <button
              onClick={() => {
                setActiveNavTab('orders');
                loadOrders();
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeNavTab === 'orders'
                  ? 'bg-[#d4af37] text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/70'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders Management</span>
              {pendingOrdersCount > 0 ? (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                  activeNavTab === 'orders'
                    ? 'bg-zinc-950 text-amber-400'
                    : 'bg-amber-500 text-zinc-950 animate-pulse'
                }`}>
                  <Clock className="w-3 h-3" />
                  <span>{pendingOrdersCount} Pending</span>
                </span>
              ) : (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeNavTab === 'orders' ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {orders.length}
                </span>
              )}
            </button>

          </div>
        </div>
      </header>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div 
            className={`p-3.5 px-4 rounded-xl shadow-2xl border text-xs font-semibold flex items-center gap-2.5 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950 border-emerald-700 text-emerald-200'
                : 'bg-rose-950 border-rose-700 text-rose-200'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {activeNavTab === 'products' ? (
          view === 'list' ? (
            <ProductList
              products={products}
              onAddNew={() => {
                setEditingProduct(null);
                setView('create');
              }}
              onEdit={(prod) => {
                setEditingProduct(prod);
                setView('edit');
              }}
              onToggleActive={handleToggleActive}
              onDeleteRequest={handleDeleteProductRequest}
              onReload={loadProducts}
            />
          ) : (
            <ProductForm
              initialProduct={editingProduct}
              onSave={handleSaveProduct}
              onCancel={() => {
                setView('list');
                setEditingProduct(null);
              }}
              onRequestDeleteVariant={handleDeleteVariantRequest}
            />
          )
        ) : (
          <OrderList
            orders={orders}
            isLoading={isLoadingOrders}
            onRefresh={loadOrders}
            onSelectOrder={(order) => setSelectedOrder(order)}
            onUpdateStatus={handleUpdateOrderStatus}
            updatingOrderId={updatingOrderId}
          />
        )}
      </main>

      {/* Audit Confirmation Modal for Deletions */}
      <AdminAuditModal
        isOpen={auditModal.isOpen}
        onClose={() => setAuditModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={auditModal.onConfirm}
        itemType={auditModal.itemType}
        itemTitle={auditModal.itemTitle}
        itemId={auditModal.itemId}
        adminEmail={adminEmail}
      />

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateOrderStatus}
        isUpdating={updatingOrderId === selectedOrder?.id}
      />

    </div>
  );
};
