import React, { useState, useEffect } from 'react';
import { 
  AdminProduct, 
  verifyAdminStatus, 
  getAdminProducts, 
  saveAdminProduct, 
  toggleProductActive, 
  deleteAdminProduct, 
  deleteAdminVariant 
} from '../../lib/adminApi';
import { AdminLogin } from './AdminLogin';
import { ProductList } from './ProductList';
import { ProductForm } from './ProductForm';
import { AdminAuditModal } from './AdminAuditModal';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { 
  ShieldCheck, 
  LogOut, 
  ArrowLeft, 
  Package, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface AdminDashboardProps {
  onExitToStore: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExitToStore }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(true);

  // View state
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);

  // Products data state
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);

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
    }
  };

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    const data = await getAdminProducts();
    setProducts(data);
    setIsLoadingProducts(false);
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
            <div className="w-9 h-9 rounded-full bg-black border border-[#d4af37] overflow-hidden flex items-center justify-center shrink-0">
              <img
                src="/images/ak_sports_logo.jpg"
                alt="AK Sports Crest"
                className="w-full h-full object-cover object-center scale-135"
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
        {view === 'list' ? (
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
        )}
      </main>

      {/* Audit Confirmation Modal */}
      <AdminAuditModal
        isOpen={auditModal.isOpen}
        onClose={() => setAuditModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={auditModal.onConfirm}
        itemType={auditModal.itemType}
        itemTitle={auditModal.itemTitle}
        itemId={auditModal.itemId}
        adminEmail={adminEmail}
      />

    </div>
  );
};
