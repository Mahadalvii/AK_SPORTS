import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Trash2, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  MessageCircle, 
  Plus, 
  Minus,
  Sparkles,
  PackageCheck
} from 'lucide-react';
import { CartItem, ThemeConfig } from '../types';
import { PageId } from './Header';
import { submitOrder } from '../lib/supabase';

interface CartPageProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
  onRemoveItem: (productId: string, selectedSize?: string) => void;
  onClearCart: () => void;
  onNavigate: (page: PageId) => void;
  theme: ThemeConfig;
}

export const CartPage: React.FC<CartPageProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onNavigate,
  theme,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [city, setCity] = useState('');
  const [faxExt, setFaxExt] = useState(''); // Bot honeypot trap field
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [orderPlaced, setOrderPlaced] = useState<{
    orderId: string;
    total: number;
    subtotal: number;
    deliveryFee: number;
    name: string;
    phone: string;
    address: string;
    city: string;
    items: { name: string; quantity: number; size?: string; price: number }[];
  } | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 3000;
  const deliveryFee = subtotal >= freeShippingThreshold || items.length === 0 ? 0 : 250;
  const total = subtotal + deliveryFee;
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);

  const majorCities = [
    'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Sialkot', 
    'Faisalabad', 'Multan', 'Peshawar', 'Gujranwala', 'Quetta'
  ];

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Disable button immediately on first click
    setIsSubmitting(true);
    setErrorMessage(null);

    // 1. Validation
    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      setIsSubmitting(false);
      return;
    }

    const cleanPhone = customerPhone.trim();
    const phoneRegex = /^03[0-9]{2}-?[0-9]{7}$/;
    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
      setErrorMessage('Please enter a valid mobile number (e.g. 0300-1234567).');
      setIsSubmitting(false);
      return;
    }

    if (!city.trim()) {
      setErrorMessage('Please select or enter your city.');
      setIsSubmitting(false);
      return;
    }

    if (!customerAddress.trim() || customerAddress.trim().length < 5) {
      setErrorMessage('Please enter your complete street delivery address.');
      setIsSubmitting(false);
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Your cart is empty.');
      setIsSubmitting(false);
      return;
    }

    try {
      const orderPayload = {
        customer_name: customerName.trim(),
        customer_phone: cleanPhone,
        customer_address: customerAddress.trim(),
        city: city.trim(),
        items: items.map((it) => ({
          product_id: it.product.id,
          variant_id: (it.product.variants && it.selectedSize)
            ? it.product.variants.find(v => v.size === it.selectedSize)?.id || null
            : null,
          quantity: it.quantity,
        })),
        fax_ext: faxExt,
      };

      const response = await submitOrder(orderPayload);

      if (!response.success || !response.order) {
        setErrorMessage(response.error || 'Could not place order. Please verify your details or message us on WhatsApp.');
        setIsSubmitting(false);
        return;
      }

      // Order created successfully
      const confirmedId = response.order.order_id;
      setOrderPlaced({
        orderId: confirmedId,
        total: response.order.total ?? total,
        subtotal: response.order.subtotal ?? subtotal,
        deliveryFee: response.order.delivery_fee ?? deliveryFee,
        name: customerName.trim(),
        phone: cleanPhone,
        address: customerAddress.trim(),
        city: city.trim(),
        items: items.map(it => ({
          name: it.product.name,
          quantity: it.quantity,
          size: it.selectedSize,
          price: it.product.price,
        })),
      });

      onClearCart();
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong, please try again or message us on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateWhatsAppOrderUrl = () => {
    if (!orderPlaced) return 'https://wa.me/923082073415?text=Hi%20AK%20Sports%2C%20I%20have%20an%20order%20question';
    const message = `Salam AK Sports! I have placed Order #${orderPlaced.orderId} for Cash On Delivery:

*Order ID:* ${orderPlaced.orderId}
*Recipient:* ${orderPlaced.name}
*Phone:* ${orderPlaced.phone}
*City:* ${orderPlaced.city}
*Address:* ${orderPlaced.address}
*Total (COD):* Rs. ${orderPlaced.total.toLocaleString()}

*Items:*
${orderPlaced.items.map(it => `• ${it.name} (x${it.quantity})${it.size ? ` [${it.size}]` : ''}`).join('\n')}

Please confirm dispatch from Sialkot workshop. JazakAllah!`;
    return `https://wa.me/923082073415?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="py-8 sm:py-12 animate-in fade-in duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs" style={{ color: theme.textMuted }}>
            <button 
              onClick={() => onNavigate('home')}
              className="hover:text-black transition-colors flex items-center gap-1 cursor-pointer font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </button>
            <span>/</span>
            <span className="font-semibold text-zinc-900">Shopping Cart</span>
          </div>

          <a
            href="https://wa.me/923082073415?text=Hi%20AK%20Sports%2C%20I%20need%20help%20with%20my%20order"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Need Help? Chat on WhatsApp</span>
          </a>
        </div>

        {/* ORDER CONFIRMATION VIEW */}
        {orderPlaced ? (
          <div 
            className="max-w-2xl mx-auto p-8 rounded-2xl border shadow-sm space-y-6 text-center"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#b89428]">
                Cash on Delivery Order Confirmed
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-zinc-900">
                Thank You for Choosing AK Sports!
              </h1>
              <p className="text-sm text-zinc-600 max-w-lg mx-auto">
                Your order has been recorded. Our Sialkot workshop team is packaging your gear for nationwide courier dispatch.
              </p>
            </div>

            <div 
              className="p-5 rounded-xl border text-left space-y-3"
              style={{ backgroundColor: theme.bg, borderColor: theme.border }}
            >
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: theme.border }}>
                <div>
                  <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-medium">Order Number</span>
                  <span className="font-mono text-lg font-bold text-zinc-900">#{orderPlaced.orderId}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-medium">Payment Method</span>
                  <span className="text-xs font-bold text-emerald-700">Cash on Delivery (COD)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-700">
                <div>
                  <span className="text-zinc-500 block">Recipient:</span>
                  <span className="font-semibold">{orderPlaced.name}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Phone:</span>
                  <span className="font-semibold">{orderPlaced.phone}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-zinc-500 block">Delivery Address:</span>
                  <span className="font-semibold">{orderPlaced.address}, {orderPlaced.city}</span>
                </div>
              </div>

              <div className="pt-3 border-t flex items-center justify-between text-sm" style={{ borderColor: theme.border }}>
                <span className="font-bold text-zinc-900">Total Payable upon Arrival:</span>
                <span className="font-display font-extrabold text-lg" style={{ color: theme.accent }}>
                  Rs. {orderPlaced.total.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center pt-2">
              <a
                href={generateWhatsAppOrderUrl()}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Notify AK Sports on WhatsApp</span>
              </a>
              <button
                onClick={() => onNavigate('home')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-semibold border hover:bg-black/5 transition-colors cursor-pointer"
                style={{ borderColor: theme.border, color: theme.textPrimary }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : items.length === 0 ? (
          /* EMPTY CART VIEW */
          <div 
            className="max-w-xl mx-auto py-16 px-6 rounded-2xl border text-center space-y-6 shadow-xs"
            style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
          >
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
              style={{ backgroundColor: theme.badgeBg }}
            >
              <ShoppingCart className="w-10 h-10" style={{ color: theme.accent }} />
            </div>

            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold text-zinc-900">
                Your Shopping Cart is Empty
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto">
                Explore our everyday athletic wear, heavyweight tees, and tournament-grade tape ball cricket gear.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('apparel')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                style={{ backgroundColor: theme.accent, color: theme.accentText }}
              >
                Browse Athletic Wear
              </button>
              <button
                onClick={() => onNavigate('bats')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold border hover:bg-black/5 transition-colors cursor-pointer"
                style={{ borderColor: theme.border, color: theme.textPrimary }}
              >
                Tape Ball Cricket
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE CART & CHECKOUT PAGE */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: CART ITEMS (8 Columns) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Free Delivery Progress Bar */}
              <div 
                className="p-4 rounded-xl border shadow-2xs space-y-2.5"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4" style={{ color: theme.accent }} />
                    <span className="font-semibold text-zinc-900">
                      {subtotal >= freeShippingThreshold ? (
                        <span className="text-emerald-700 font-bold">You unlocked FREE Nationwide Delivery!</span>
                      ) : (
                        <span>Add <strong style={{ color: theme.accent }}>Rs. {amountNeeded.toLocaleString()}</strong> more for FREE nationwide delivery</span>
                      )}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 font-mono">Threshold: Rs. 3,000</span>
                </div>

                <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${progressPercent}%`,
                      backgroundColor: subtotal >= freeShippingThreshold ? '#059669' : theme.accent,
                    }}
                  />
                </div>
              </div>

              {/* Items Card List */}
              <div 
                className="rounded-2xl border divide-y shadow-xs overflow-hidden"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
              >
                <div className="p-4 sm:px-6 flex items-center justify-between" style={{ backgroundColor: '#faf9f5' }}>
                  <h2 className="font-display font-bold text-base text-zinc-900">
                    Cart Items ({items.reduce((s, it) => s + it.quantity, 0)})
                  </h2>
                  <button
                    onClick={onClearCart}
                    className="text-xs text-zinc-500 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Cart</span>
                  </button>
                </div>

                <div className="divide-y" style={{ borderColor: theme.border }}>
                  {items.map((item, idx) => (
                    <div key={`${item.product.id}-${item.selectedSize || 'default'}-${idx}`} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4">
                      {/* Product Thumbnail */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border overflow-hidden shrink-0 bg-white" style={{ borderColor: theme.border }}>
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover object-center"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 flex flex-col justify-between gap-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-[#b89428]">
                              {item.product.category.toUpperCase()}
                            </span>
                            <h3 className="font-display font-bold text-sm sm:text-base text-zinc-900">
                              {item.product.name}
                            </h3>
                            {item.selectedSize && (
                              <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded border font-medium text-zinc-700" style={{ borderColor: theme.border, backgroundColor: theme.bg }}>
                                Size: {item.selectedSize}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.product.id, item.selectedSize)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remove Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price & Quantity Controls */}
                        <div className="flex items-center justify-between gap-3 pt-2">
                          <div className="flex items-center border rounded-lg overflow-hidden bg-white" style={{ borderColor: theme.border }}>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1, item.selectedSize)}
                              className="p-1.5 px-2 hover:bg-zinc-100 transition-colors text-zinc-700 cursor-pointer disabled:opacity-30"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-semibold tabular-nums text-zinc-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, Math.min(10, item.quantity + 1), item.selectedSize)}
                              className="p-1.5 px-2 hover:bg-zinc-100 transition-colors text-zinc-700 cursor-pointer disabled:opacity-30"
                              disabled={item.quantity >= 10}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="font-display font-bold text-sm sm:text-base tabular-nums" style={{ color: theme.accent }}>
                              Rs. {(item.product.price * item.quantity).toLocaleString()}
                            </span>
                            {item.quantity > 1 && (
                              <span className="text-[10px] text-zinc-500 block">
                                Rs. {item.product.price.toLocaleString()} each
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guarantees Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border flex items-center gap-2.5 shadow-2xs" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                  <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: theme.accent }} />
                  <div className="text-[11px] leading-snug">
                    <strong className="block text-zinc-900">100% Cash on Delivery</strong>
                    <span className="text-zinc-500">Pay only when verified</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border flex items-center gap-2.5 shadow-2xs" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                  <PackageCheck className="w-4 h-4 shrink-0" style={{ color: theme.accent }} />
                  <div className="text-[11px] leading-snug">
                    <strong className="block text-zinc-900">Sialkot Direct Craft</strong>
                    <span className="text-zinc-500">Workshop-level QC</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border flex items-center gap-2.5 shadow-2xs" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                  <Truck className="w-4 h-4 shrink-0" style={{ color: theme.accent }} />
                  <div className="text-[11px] leading-snug">
                    <strong className="block text-zinc-900">3-5 Day Dispatch</strong>
                    <span className="text-zinc-500">All Pakistan cities</span>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: FAST CASH ON DELIVERY CHECKOUT (5 Columns) */}
            <div className="lg:col-span-5 space-y-6">
              
              <div 
                className="p-6 rounded-2xl border shadow-sm space-y-5"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#b89428]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Express Checkout</span>
                  </div>
                  <h3 className="font-display font-extrabold text-xl text-zinc-900">
                    Delivery Details
                  </h3>
                  <p className="text-xs text-zinc-600">
                    Pay with Cash on Delivery at your doorstep anywhere in Pakistan.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="flex-1 leading-relaxed">{errorMessage}</div>
                  </div>
                )}

                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-800 block">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Muhammad Ali"
                      className="w-full px-3.5 py-2.5 rounded-xl border text-xs text-zinc-900 bg-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                      style={{ borderColor: theme.border }}
                    />
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-zinc-800 block">
                        Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-zinc-500">For courier delivery SMS/call</span>
                    </div>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="0300-1234567"
                      className="w-full px-3.5 py-2.5 rounded-xl border text-xs text-zinc-900 bg-white placeholder-zinc-400 font-mono focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                      style={{ borderColor: theme.border }}
                    />
                  </div>

                  {/* City with Quick Selection Buttons */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-800 block">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Lahore, Karachi, Islamabad"
                      className="w-full px-3.5 py-2.5 rounded-xl border text-xs text-zinc-900 bg-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                      style={{ borderColor: theme.border }}
                    />
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {majorCities.slice(0, 5).map((c) => (
                        <button
                          type="button"
                          key={c}
                          onClick={() => setCity(c)}
                          className="text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer"
                          style={{
                            borderColor: city === c ? theme.accent : theme.border,
                            backgroundColor: city === c ? theme.badgeBg : '#ffffff',
                            color: city === c ? theme.accent : '#52525b',
                            fontWeight: city === c ? 700 : 500,
                          }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-800 block">
                      Complete Street Address <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="House / Flat #, Street name, Sector / Area landmark..."
                      className="w-full px-3.5 py-2 rounded-xl border text-xs text-zinc-900 bg-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                      style={{ borderColor: theme.border }}
                    />
                  </div>

                  {/* Bot Honeypot field (hidden off-screen for spam filtering) */}
                  <div 
                    aria-hidden="true" 
                    style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}
                  >
                    <label htmlFor="cart-fax-ext">Leave this field blank</label>
                    <input
                      id="cart-fax-ext"
                      type="text"
                      name="fax_ext"
                      value={faxExt}
                      onChange={(e) => setFaxExt(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  {/* Order Financial Summary */}
                  <div className="pt-4 border-t space-y-2 text-xs" style={{ borderColor: theme.border }}>
                    <div className="flex justify-between text-zinc-600">
                      <span>Items Subtotal</span>
                      <span className="font-semibold text-zinc-900 tabular-nums">Rs. {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-zinc-600">
                      <span>Delivery Fee</span>
                      <span className="font-semibold text-zinc-900 tabular-nums">
                        {deliveryFee === 0 ? (
                          <span className="text-emerald-700 font-bold">FREE</span>
                        ) : (
                          `Rs. ${deliveryFee}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-600">
                      <span>Payment Method</span>
                      <span className="font-semibold text-zinc-900">Cash on Delivery</span>
                    </div>

                    <div className="pt-3 border-t flex justify-between items-baseline" style={{ borderColor: theme.border }}>
                      <span className="font-bold text-sm text-zinc-900">Total (COD)</span>
                      <span className="font-display font-extrabold text-xl tabular-nums" style={{ color: theme.accent }}>
                        Rs. {total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Submit Button with Instant Disable on First Click */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer active:scale-98 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: theme.accent,
                      color: theme.accentText,
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing Order...</span>
                      </>
                    ) : (
                      <>
                        <PackageCheck className="w-4 h-4" />
                        <span>Confirm Order (Cash on Delivery)</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-zinc-500">
                    By clicking Confirm, your order is dispatched from Sialkot. You pay upon receiving the parcel.
                  </p>
                </form>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
