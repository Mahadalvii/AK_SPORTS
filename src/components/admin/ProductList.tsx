import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  EyeOff, 
  Edit3, 
  Trash2, 
  Layers, 
  DollarSign, 
  Package, 
  Sparkles,
  ExternalLink,
  Video
} from 'lucide-react';
import { AdminProduct } from '../../lib/adminApi';

interface ProductListProps {
  products: AdminProduct[];
  onAddNew: () => void;
  onEdit: (product: AdminProduct) => void;
  onToggleActive: (productId: string, currentActive: boolean) => void;
  onDeleteRequest: (product: AdminProduct) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  onAddNew,
  onEdit,
  onToggleActive,
  onDeleteRequest,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'hidden'>('all');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category_label.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || p.category === selectedCategory;

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && p.is_active) ||
        (statusFilter === 'hidden' && !p.is_active);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, selectedCategory, statusFilter]);

  const totalStock = products.reduce((acc, p) => {
    const varStock = p.variants?.reduce((s, v) => s + (v.stock || 0), 0) || 0;
    return acc + varStock;
  }, 0);

  const activeCount = products.filter(p => p.is_active).length;

  return (
    <div className="space-y-6">
      
      {/* Top Bar with KPI Metrics & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="font-display font-extrabold text-xl text-white tracking-wide">
            Product Catalog Inventory
          </h2>
          <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
            <span><strong>{products.length}</strong> Total SKUs</span>
            <span>·</span>
            <span className="text-emerald-400"><strong>{activeCount}</strong> Active on Store</span>
            <span>·</span>
            <span><strong>{totalStock}</strong> Units In Stock</span>
          </div>
        </div>

        <button
          onClick={onAddNew}
          className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#d4af37] hover:bg-[#c29e2f] text-black transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title, slug, or label..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-zinc-800 bg-[#1a1a1d] text-white placeholder-zinc-500 text-xs focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
        </div>

        {/* Category Filter */}
        <div className="sm:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-[#1a1a1d] text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
          >
            <option value="all">All Categories</option>
            <option value="apparel">Athletic Wear (apparel)</option>
            <option value="bats">Tape Ball Bats (bats)</option>
            <option value="balls">Tournament Balls (balls)</option>
            <option value="gloves">Gloves &amp; Armor (gloves)</option>
            <option value="kits">Accessories (kits)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-[#1a1a1d] text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="hidden">Hidden Only</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#18181b] rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#121214] text-[11px] uppercase tracking-wider font-mono text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price (PKR)</th>
                <th className="py-3 px-4">Variants / Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    No products found matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const stockSum = p.variants?.reduce((s, v) => s + (v.stock || 0), 0) || 0;
                  return (
                    <tr 
                      key={p.id}
                      className="hover:bg-zinc-800/30 transition-colors group"
                    >
                      {/* Product Thumbnail & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-black border border-zinc-700 overflow-hidden shrink-0">
                            <img
                              src={p.image_url || '/images/ak_sports_logo.jpg'}
                              alt={p.name}
                              className="w-full h-full object-cover object-center"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-[#d4af37] transition-colors">
                              {p.name}
                            </div>
                            <div className="font-mono text-[10px] text-zinc-500">
                              Slug: {p.id}
                            </div>
                            {p.video_url && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-sky-400 mt-0.5">
                                <Video className="w-3 h-3" />
                                <span>Has Video</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded border border-zinc-700 bg-zinc-900 text-[10px] uppercase font-mono text-[#d4af37]">
                          {p.category}
                        </span>
                        <span className="block text-[11px] text-zinc-400 mt-0.5">
                          {p.category_label}
                        </span>
                      </td>

                      {/* Price (Whole Rupees only) */}
                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-white">
                          Rs. {Math.round(p.price).toLocaleString()}
                        </div>
                        {p.original_price && p.original_price > p.price && (
                          <div className="text-[10px] line-through text-zinc-500">
                            Rs. {Math.round(p.original_price).toLocaleString()}
                          </div>
                        )}
                      </td>

                      {/* Variants / Stock */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
                          <Package className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{stockSum} units</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 block">
                          {p.variants?.length || 0} size options
                        </span>
                      </td>

                      {/* Status & is_active Toggle */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => onToggleActive(p.id, p.is_active)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                            p.is_active
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700 hover:bg-emerald-900/90'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                          }`}
                          title={p.is_active ? 'Click to Hide on store' : 'Click to Make Active'}
                        >
                          {p.is_active ? (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Hidden</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEdit(p)}
                            className="p-1.5 rounded-lg border border-zinc-700 hover:border-[#d4af37] text-zinc-300 hover:text-[#d4af37] bg-zinc-900 transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteRequest(p)}
                            className="p-1.5 rounded-lg border border-zinc-700 hover:border-rose-500 text-zinc-400 hover:text-rose-400 bg-zinc-900 transition-colors cursor-pointer"
                            title="Delete Product (Audit Confirm)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
