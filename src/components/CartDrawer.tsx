import React, { useState } from 'react';
import { X, Trash2, ShoppingCart, MessageCircle, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { CartItem, ThemeConfig } from '../types';
import { submitOrder } from '../lib/supabase';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
  onRemoveItem: (productId: string, selectedSize?: string) => void;
  onClearCart: () => void;
  theme: ThemeConfig;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
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
    name: string;
    phone: string;
    city: string;
  } | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 3000;
  const deliveryFee = subtotal >= freeShippingThreshold || items.length === 0 ? 0 : 250;
  const total = subtotal + deliveryFee;
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Disable the button immediately on the first click
    setIsSubmitting(true);
    setErrorMessage(null);

    // 1. Client-Side Validation
    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      setIsSubmitting(false);
      return;
    }

    const cleanPhone = customerPhone.trim();
    // Validate Pakistani mobile format: 03XX-XXXXXXX or 03XXXXXXXXX
    const phoneRegex = /^03[0-9]{2}-?[0-9]{7}$/;
    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
      setErrorMessage('Please enter a valid mobile number (e.g. 0300-1234567).');
      setIsSubmitting(false);
      return;
    }

    if (!city.trim()) {
      setErrorMessage('Please enter your city (e.g. Bahawalnagar, Lahore, Karachi).');
      setIsSubmitting(false);
      return;
    }

    if (!customerAddress.trim() || customerAddress.trim().length < 5) {
      setErrorMessage('Please enter your full street delivery address.');
      setIsSubmitting(false);
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Your cart is empty.');
      setIsSubmitting(false);
      return;
    }

    try {
      // 2. Submit to Supabase Edge Function 'create-order'
      const orderPayload = {
        customer_name: customerName.trim(),
        customer_phone: cleanPhone,
        customer_address: customerAddress.trim(),
        city: city.trim(),
        items: items.map((it) => ({
          product_id: it.product.id,
          // If variant exists, pass variant ID or null
          variant_id: (it.product.variants && it.selectedSize)
            ? it.product.variants.find(v => v.size === it.selectedSize)?.id || null
            : null,
          quantity: it.quantity,
        })),
        // Hidden bot honeypot
        fax_ext: faxExt,
      };

      const response = await submitOrder(orderPayload);

      if (!response.success || !response.order) {
        setErrorMessage(response.error || 'Could not place order. Please check your details and try again.');
        setIsSubmitting(false);
        return;
      }

      // Order created successfully (safely handles fake-success honeypot responses where only order_id is present)
      const confirmedId = response.order.order_id;
      setOrderPlaced({
        orderId: confirmedId,
        total: response.order.total ?? total,
        name: customerName.trim() || 'Valued Customer',
        phone: cleanPhone || 'Customer Phone',
        city: city.trim() || 'Pakistan',
      });
      onClearCart();
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error placing order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateWhatsAppOrderUrl = () => {
    if (orderPlaced) {
      const confirmedMsg = `Salam AK Sports! I have placed Order #${orderPlaced.orderId} for Cash On Delivery:

Order ID: ${orderPlaced.orderId}
Recipient: ${orderPlaced.name}
Mobile: ${orderPlaced.phone}
City: ${orderPlaced.city}
Total (COD): Rs. ${orderPlaced.total.toLocaleString()}

Please confirm dispatch from Bahawalnagar outlet. JazakAllah!`;
      return `https://wa.me/923082073415?text=${encodeURIComponent(confirmedMsg)}`;
    }

    const itemsList = items
      .map(
        (it) =>
          `• ${it.product.name} (x${it.quantity})${it.selectedSize ? ` [${it.selectedSize}]` : ''} - Rs. ${(it.product.price * it.quantity).toLocaleString()}`
      )
      .join('\n');

    const message = `Salam AK Sports! I would like to place an order:

${itemsList}

Subtotal: Rs. ${subtotal.toLocaleString()}
Delivery Fee: ${deliveryFee === 0 ? 'FREE' : `Rs. ${deliveryFee}`}
Total: Rs. ${total.toLocaleString()}
Payment Method: Cash On Delivery (COD)

Customer Details:
Name: ${customerName || 'Pending'}
Phone: ${customerPhone || 'Pending'}
City: ${city || 'Pending'}
Address: ${customerAddress || 'Pending'}

Please confirm delivery time and dispatch.`;

    return `https://wa.me/923082073415?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md h-full flex flex-col justify-between shadow-2xl border-l transition-all duration-300"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.border,
          color: theme.textPrimary,
        }}
      >
        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" style={{ color: theme.accent }} />
            <h3 className="font-display font-bold text-lg">Shopping Cart</h3>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: theme.badgeBg, color: theme.accent }}>
              {items.reduce((acc, i) => acc + i.quantity, 0)} items
            </span>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close cart"
            className="p-1.5 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Order Confirmed View */}
        {orderPlaced ? (
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4 overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="font-display font-bold text-2xl text-zinc-900">
              Order Confirmed!
            </h4>
            <p className="text-xs text-zinc-600">
              Your official order ID is <span className="font-mono font-bold text-[#b89428] text-sm">{orderPlaced.orderId}</span>. 
              Our Bahawalnagar outlet has recorded your order for courier dispatch.
            </p>
            <div className="p-4 rounded-xl border w-full text-left text-xs space-y-2.5" style={{ backgroundColor: theme.bg, borderColor: theme.border }}>
              <div className="flex justify-between">
                <span className="text-zinc-500">Order ID:</span>
                <span className="font-mono font-bold text-zinc-900">{orderPlaced.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Recipient:</span>
                <span className="font-semibold text-zinc-900">{orderPlaced.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Mobile:</span>
                <span className="font-semibold text-zinc-900">{orderPlaced.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Destination:</span>
                <span className="font-semibold text-zinc-900">{orderPlaced.city}</span>
              </div>
              <div className="flex justify-between pt-1 border-t" style={{ borderColor: theme.border }}>
                <span className="text-zinc-500 font-semibold">Total Payable (COD):</span>
                <span className="font-bold text-[#b89428]">Rs. {orderPlaced.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="w-full space-y-2 pt-2">
              <a
                href={generateWhatsAppOrderUrl()}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm text-center"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Confirm Order on WhatsApp</span>
              </a>

              <button
                onClick={() => {
                  setOrderPlaced(null);
                  setCustomerName('');
                  setCustomerPhone('');
                  setCustomerAddress('');
                  setCity('');
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-colors cursor-pointer"
                style={{
                  borderColor: theme.border,
                  color: theme.textPrimary,
                }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Free Shipping Meter */}
            <div className="px-5 py-3 border-b text-xs space-y-1.5" style={{ backgroundColor: theme.bg, borderColor: theme.border }}>
              <div className="flex justify-between font-medium">
                <span>
                  {subtotal >= freeShippingThreshold ? (
                    <span className="text-emerald-600 font-semibold">🎉 You unlocked FREE Nationwide Delivery!</span>
                  ) : (
                    <span>Add <strong>Rs. {(freeShippingThreshold - subtotal).toLocaleString()}</strong> more for FREE Delivery</span>
                  )}
                </span>
                <span className="font-mono text-[11px] text-zinc-500">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-zinc-200 overflow-hidden">
                <div 
                  className="h-full transition-all duration-300 rounded-full"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: progressPercent >= 100 ? '#10b981' : theme.accent,
                  }}
                />
              </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12">
                  <ShoppingCart className="w-12 h-12 opacity-30 text-zinc-400" />
                  <p className="text-sm font-semibold text-zinc-800">Your cart is empty</p>
                  <p className="text-xs max-w-xs text-zinc-500">
                    Explore our performance athletic trousers, combed heavy-cotton tees, and tournament cricket bats.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div 
                      key={`${item.product.id}-${item.selectedSize || idx}`}
                      className="p-3 rounded-xl border flex gap-3 items-center"
                      style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                    >
                      <img 
                        src={item.product.image} 
                        alt={item.product.name} 
                        className="w-16 h-16 rounded-lg object-cover shrink-0" 
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold truncate text-zinc-900">
                          {item.product.name}
                        </h4>
                        {item.selectedSize && (
                          <span className="text-[10px] block font-mono text-[#b89428]">
                            {item.selectedSize}
                          </span>
                        )}
                        <span className="text-xs font-bold font-mono block mt-1 text-[#b89428]">
                          Rs. {(item.product.price * item.quantity).toLocaleString()}
                        </span>
                      </div>

                      {/* Steppers & Remove */}
                      <div className="flex flex-col items-end gap-1.5">
                        <button
                          onClick={() => onRemoveItem(item.product.id, item.selectedSize)}
                          className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex items-center border rounded-md overflow-hidden text-xs" style={{ borderColor: theme.border }}>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1, item.selectedSize)}
                            className="px-2 py-0.5 hover:bg-black/5"
                          >
                            -
                          </button>
                          <span className="px-2 py-0.5 font-mono">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1, item.selectedSize)}
                            className="px-2 py-0.5 hover:bg-black/5"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Checkout Form (if cart has items) */}
              {items.length > 0 && (
                <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-3.5 pt-4 border-t" style={{ borderColor: theme.border }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider block text-zinc-900">
                      Delivery Details
                    </span>
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Cash On Delivery
                    </span>
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Honeypot hidden input named fax_ext for anti-bot trap */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      left: '-9999px',
                      top: '-9999px',
                      width: '1px',
                      height: '1px',
                      overflow: 'hidden',
                      opacity: 0,
                      pointerEvents: 'none',
                    }}
                  >
                    <label htmlFor="fax_ext">Fax Extension</label>
                    <input
                      type="text"
                      id="fax_ext"
                      name="fax_ext"
                      tabIndex={-1}
                      autoComplete="off"
                      value={faxExt}
                      onChange={(e) => setFaxExt(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div>
                      <input
                        type="text"
                        placeholder="Your Full Name *"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 text-base sm:text-xs rounded-lg border outline-none transition-colors"
                        style={{
                          backgroundColor: theme.bg,
                          borderColor: theme.border,
                          color: theme.textPrimary,
                        }}
                      />
                    </div>

                    <div>
                      <input
                        type="tel"
                        placeholder="Mobile / WhatsApp: 03XX-XXXXXXX *"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 text-base sm:text-xs rounded-lg border outline-none transition-colors font-mono"
                        style={{
                          backgroundColor: theme.bg,
                          borderColor: theme.border,
                          color: theme.textPrimary,
                        }}
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="City (e.g. Bahawalnagar, Lahore, Karachi, Islamabad) *"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 text-base sm:text-xs rounded-lg border outline-none transition-colors"
                        style={{
                          backgroundColor: theme.bg,
                          borderColor: theme.border,
                          color: theme.textPrimary,
                        }}
                      />
                    </div>

                    <div>
                      <textarea
                        placeholder="Street Address, House/Shop #, Landmark *"
                        required
                        rows={2}
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="w-full px-3 py-2 text-base sm:text-xs rounded-lg border outline-none transition-colors resize-none"
                        style={{
                          backgroundColor: theme.bg,
                          borderColor: theme.border,
                          color: theme.textPrimary,
                        }}
                      />
                    </div>
                  </div>

                  {/* Payment Method - Cash on Delivery Only */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold block text-zinc-500">
                      Payment Method:
                    </label>
                    <div 
                      className="p-2.5 rounded-lg border text-xs flex items-center justify-between"
                      style={{
                        borderColor: theme.accent,
                        backgroundColor: theme.badgeBg,
                        color: theme.accent,
                      }}
                    >
                      <span className="font-semibold text-zinc-900">Cash on Delivery (COD)</span>
                      <span className="text-[10px] text-zinc-600 font-medium">Pay at Doorstep</span>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Footer Summary & Checkout Actions */}
            {items.length > 0 && (
              <div className="p-5 border-t space-y-3" style={{ borderColor: theme.border, backgroundColor: theme.bg }}>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-zinc-600">
                    <span>Subtotal</span>
                    <span className="font-mono tabular-nums">Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Courier Delivery</span>
                    <span className="font-mono tabular-nums">
                      {deliveryFee === 0 ? <span className="text-emerald-600 font-semibold">FREE</span> : `Rs. ${deliveryFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-1 border-t text-zinc-900" style={{ borderColor: theme.border }}>
                    <span>Total Payable</span>
                    <span className="font-mono tabular-nums text-[#b89428]">
                      Rs. {total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-1">
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer shadow-sm flex items-center justify-center gap-2 hover:opacity-95 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                    style={{
                      backgroundColor: theme.accent,
                      color: theme.accentText,
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Securing Your Order...</span>
                      </>
                    ) : (
                      <>
                        <span>Place Order (Cash on Delivery)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <a
                    href={generateWhatsAppOrderUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs text-center"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Order via WhatsApp</span>
                  </a>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
