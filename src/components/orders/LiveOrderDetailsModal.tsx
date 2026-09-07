import React from 'react';
import {
  X,
  CheckCircle2,
  Bike,
  User,
  Phone,
  Package,
  Clock,
  MapPin,
  Store,
  Warehouse,
  Home,
  Navigation
} from 'lucide-react';
import { Order } from '../../types';

interface LiveOrderDetailsModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
}

export const LiveOrderDetailsModal: React.FC<LiveOrderDetailsModalProps> = ({
  isOpen,
  order,
  onClose
}) => {
  if (!isOpen || !order) return null;

  // Determine stage progression:
  // Stage 1: Order Confirmed
  // Stage 2: Delivery Partner Assigned
  // Stage 3: Out for Delivery
  // Stage 4: Delivered
  const status = (order.status || 'pending').toLowerCase();
  const rawPartner = (order as any).delivery?.delivery_partner || (order as any).deliveryPartner;
  const hasPartner = Boolean(rawPartner?.name || rawPartner);

  const isConfirmed = true; // Any active order is at least confirmed
  const isPartnerAssigned =
    hasPartner ||
    status === 'packing' ||
    status === 'packed' ||
    status === 'shipped' ||
    status === 'out_for_delivery' ||
    status === 'near_destination' ||
    status === 'delivered';
  const isOutForDelivery =
    status === 'shipped' ||
    status === 'out_for_delivery' ||
    status === 'near_destination' ||
    status === 'delivered';
  const isDelivered = status === 'delivered';

  // Rider position on the arc based on status
  // Arc: M 70 145 C 130 40, 270 40, 330 145
  const riderPos = isOutForDelivery
    ? { x: 275, y: 92, label: 'Out for delivery' }
    : isPartnerAssigned
    ? { x: 200, y: 66, label: 'Partner assigned' }
    : { x: 120, y: 96, label: 'Packing at warehouse' };

  // Subtotal & Financial calculations
  const itemsSubtotal =
    order.subtotal ||
    order.itemTotal ||
    (order.items || []).reduce((sum, item) => {
      const price = item.product?.price || 0;
      return sum + price * (item.quantity || 1);
    }, 0);

  const deliveryFee = order.deliveryFee ?? 0;
  const handlingFee = order.handlingFee ?? (order.fees ?? 0);
  const discount = order.discount ?? (order.discountAmount ?? 0);
  const totalAmount = order.totalAmount || itemsSubtotal + deliveryFee + handlingFee - discount;

  const orderNumber =
    order.id?.length > 8 ? order.id.slice(-6).toUpperCase() : order.id || 'ORDER';

  const customerDestination =
    order.area ||
    (order.address ? order.address.split(',')[0] : 'Kolkata');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="live-order-details-modal"
        className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with Order ID & Close Button */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Live Order
                </span>
                <span className="text-xs font-mono font-black text-slate-900 bg-slate-200/80 px-2 py-0.5 rounded-md">
                  #{orderNumber}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-emerald-600" />
                <span>Express 60-min Delivery in progress</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-live-order-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* ============================================================ */}
          {/* 1. TOP STATUS PIPELINE LINE (ONE BY ONE) & ZOMATO-STYLE MAP */}
          {/* ============================================================ */}
          <div className="space-y-3">
            {/* Header with Live Badge */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Live Order Tracking
              </span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>
                  {isOutForDelivery
                    ? 'Out for Delivery'
                    : isPartnerAssigned
                    ? 'Partner Assigned'
                    : 'Order Confirmed'}
                </span>
              </div>
            </div>

            {/* Above of Map: Clean line showing messages one by one connected with '<' */}
            <div
              id="live-order-status-line"
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 shadow-xs select-none pointer-events-none"
            >
              <div className="flex items-center justify-between gap-1 text-[11px] sm:text-xs font-bold overflow-x-auto scrollbar-none">
                {/* Message 1: Order Confirmed */}
                <div
                  className={`flex items-center gap-1.5 shrink-0 transition-colors ${
                    isConfirmed ? 'text-emerald-800' : 'text-slate-400'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                      isConfirmed
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    ✓
                  </div>
                  <span className="whitespace-nowrap font-extrabold">Order Confirmed</span>
                </div>

                <span className="text-slate-300 font-black px-0.5 shrink-0">&lt;</span>

                {/* Message 2: Delivery Partner Assigned */}
                <div
                  className={`flex items-center gap-1.5 shrink-0 transition-colors ${
                    isPartnerAssigned ? 'text-emerald-800' : 'text-slate-400'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                      isPartnerAssigned
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isPartnerAssigned ? '✓' : '2'}
                  </div>
                  <span className="whitespace-nowrap font-extrabold">Partner Assigned</span>
                </div>

                <span className="text-slate-300 font-black px-0.5 shrink-0">&lt;</span>

                {/* Message 3: Out for Delivery */}
                <div
                  className={`flex items-center gap-1.5 shrink-0 transition-colors ${
                    isOutForDelivery ? 'text-emerald-800 font-black' : 'text-slate-400'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                      isOutForDelivery
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isOutForDelivery ? '✓' : '3'}
                  </div>
                  <span className="whitespace-nowrap font-extrabold">Out for Delivery</span>
                </div>
              </div>
            </div>

            {/* ZOMATO-STYLE LIVE MAP: Shows Warehouse/Store Location + User Delivery Location + Arc Line [- - - - - -] */}
            <div
              id="zomato-live-order-map-container"
              className="relative w-full h-52 sm:h-56 rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-[#f8fafc] select-none"
            >
              {/* Cartographic SVG Map Background & Arc Path */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 400 200"
                preserveAspectRatio="xMidYMid meet"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background Map Canvas */}
                <rect width="400" height="200" fill="#f8fafc" />

                {/* City Terrain Contours / Soft Green Zones */}
                <path
                  d="M -20 30 Q 60 10 120 40 T 260 20 T 420 50 L 420 -10 L -20 -10 Z"
                  fill="#eafaf1"
                  opacity="0.85"
                />
                <path
                  d="M 280 220 Q 330 160 380 180 T 440 220 Z"
                  fill="#eafaf1"
                  opacity="0.8"
                />

                {/* Primary & Secondary Road Grids (Zomato-style clean streets) */}
                <path
                  d="M 0 60 H 400"
                  stroke="#e2e8f0"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <path
                  d="M 0 160 H 400"
                  stroke="#e2e8f0"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <path
                  d="M 110 0 V 200"
                  stroke="#e2e8f0"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M 290 0 V 200"
                  stroke="#e2e8f0"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M 0 110 Q 150 130 250 80 T 400 120"
                  stroke="#e9eef2"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M 180 0 Q 210 100 220 200"
                  stroke="#e9eef2"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Soft Glowing Corridor behind the Arc */}
                <path
                  d="M 70 145 C 130 40, 270 40, 330 145"
                  stroke="#d1fae5"
                  strokeWidth="9"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Main Connecting Arc Line [- - - - - -] */}
                <path
                  d="M 70 145 C 130 40, 270 40, 330 145"
                  stroke="#059669"
                  strokeWidth="3.5"
                  strokeDasharray="8 6"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Warehouse / Store Pin Base Pulse */}
                <circle cx="70" cy="145" r="12" fill="#f59e0b" fillOpacity="0.2" className="animate-ping" />
                <circle cx="70" cy="145" r="7" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                <circle cx="70" cy="145" r="2.5" fill="#ffffff" />

                {/* User Delivery Location Pin Base Pulse */}
                <circle cx="330" cy="145" r="14" fill="#059669" fillOpacity="0.25" className="animate-ping" />
                <circle cx="330" cy="145" r="8" fill="#059669" stroke="#ffffff" strokeWidth="2" />
                <circle cx="330" cy="145" r="3" fill="#ffffff" />

                {/* Active Delivery Rider marker on the Arc */}
                <g transform={`translate(${riderPos.x}, ${riderPos.y})`}>
                  {/* Outer pulse */}
                  <circle cx="0" cy="0" r="12" fill="#10b981" fillOpacity="0.25" className="animate-ping" />
                  {/* Rider icon circle */}
                  <circle cx="0" cy="0" r="7.5" fill="#059669" stroke="#ffffff" strokeWidth="1.8" />
                </g>
              </svg>

              {/* Rider Bike Pin Floating Element (Aligned over riderPos in SVG) */}
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-700 ease-out"
                style={{
                  left: `${(riderPos.x / 400) * 100}%`,
                  top: `${(riderPos.y / 200) * 100}%`
                }}
              >
                <div className="relative">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg ring-2 ring-white">
                    <Bike className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs">
                    {riderPos.label}
                  </div>
                </div>
              </div>

              {/* Warehouse / Store Location Card (Left Pin) */}
              <div className="absolute left-3 top-3 pointer-events-none">
                <div className="bg-white/95 backdrop-blur-xs border border-amber-200/90 rounded-xl px-2.5 py-1.5 shadow-md flex items-center gap-2 max-w-[170px]">
                  <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Warehouse className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 block">
                      Warehouse / Store
                    </span>
                    <span className="text-[11px] font-black text-slate-900 truncate block">
                      Giriraj Power Hub
                    </span>
                    <span className="text-[9px] text-slate-500 truncate block">
                      Kasba, Kolkata
                    </span>
                  </div>
                </div>
              </div>

              {/* User Delivery Location Card (Right Pin) */}
              <div className="absolute right-3 top-3 pointer-events-none">
                <div className="bg-white/95 backdrop-blur-xs border border-emerald-200/90 rounded-xl px-2.5 py-1.5 shadow-md flex items-center gap-2 max-w-[170px] text-right">
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 block">
                      Delivery Location
                    </span>
                    <span className="text-[11px] font-black text-slate-900 truncate block">
                      {customerDestination}
                    </span>
                    <span className="text-[9px] text-slate-500 truncate block">
                      {order.area || 'Kolkata'}
                    </span>
                  </div>
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Home className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Bottom Transit Arc Legend */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 pointer-events-none">
                <div className="bg-slate-900/85 backdrop-blur-xs text-emerald-300 text-[10px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-2 border border-slate-700/60">
                  <span className="font-mono text-emerald-400 font-black tracking-widest text-[11px]">
                    [- - - - - -]
                  </span>
                  <span>Direct Express Route</span>
                </div>
              </div>
            </div>

            {/* Stepper Status Buttons (Look-only button styling) */}
            <div
              id="live-order-status-pipeline"
              className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1"
            >
              {/* Stage 1: Order Confirmed */}
              <div
                className={`relative px-3 py-2 rounded-xl border font-bold text-xs flex items-center gap-2 shadow-2xs select-none pointer-events-none transition-colors ${
                  isConfirmed
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 ring-1 ring-emerald-400/50'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    isConfirmed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-extrabold text-[12px]">Order Confirmed</div>
                  <div className="text-[10px] font-medium text-emerald-700">Received &amp; verified</div>
                </div>
              </div>

              {/* Stage 2: Delivery Partner Assigned */}
              <div
                className={`relative px-3 py-2 rounded-xl border font-bold text-xs flex items-center gap-2 shadow-2xs select-none pointer-events-none transition-colors ${
                  isPartnerAssigned
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 ring-1 ring-emerald-400/50'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    isPartnerAssigned
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isPartnerAssigned ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <span className="text-[10px] font-black">2</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-extrabold text-[12px]">Partner Assigned</div>
                  <div className="text-[10px] font-medium text-emerald-700 truncate">
                    {rawPartner?.name ? String(rawPartner.name) : isPartnerAssigned ? 'Partner allocated' : 'Allocating...'}
                  </div>
                </div>
              </div>

              {/* Stage 3: Out for Delivery */}
              <div
                className={`relative px-3 py-2 rounded-xl border font-bold text-xs flex items-center gap-2 shadow-2xs select-none pointer-events-none transition-colors ${
                  isOutForDelivery
                    ? 'bg-emerald-600 border-emerald-600 text-white ring-2 ring-emerald-300 shadow-md'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    isOutForDelivery ? 'bg-white text-emerald-700' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isOutForDelivery ? (
                    <Bike className="w-3.5 h-3.5 animate-pulse" />
                  ) : (
                    <span className="text-[10px] font-black">3</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-extrabold text-[12px]">Out for Delivery</div>
                  <div className={`text-[10px] font-medium truncate ${isOutForDelivery ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {isOutForDelivery ? 'Heading to you' : 'Next stage'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 2. ORDER DETAILS (Items name of each products)               */}
          {/* ============================================================ */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Order Items ({order.items?.length || 0})
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Price
              </span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-slate-50/50 p-2 sm:p-3 space-y-2">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => {
                  const unitPrice = item.product?.price || 0;
                  const itemTotalPrice = unitPrice * (item.quantity || 1);
                  const color = item.selectedColor || (item.product as any)?.selectedColor;

                  return (
                    <div
                      key={idx}
                      className="pt-2 first:pt-0 pb-2 last:pb-0 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.product?.image ? (
                          <img
                            src={item.product.image}
                            alt=""
                            className="w-11 h-11 object-contain bg-white rounded-lg p-1 border border-slate-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                            <Package className="w-5 h-5" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                            {item.product?.name || 'Electrical Item'}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span>
                              Qty: <strong className="text-slate-800">{item.quantity}</strong>
                            </span>
                            <span>•</span>
                            <span>₹{unitPrice.toLocaleString('en-IN')} each</span>
                            {color && (
                              <>
                                <span>•</span>
                                <span className="capitalize">{color}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          ₹{itemTotalPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-3 text-xs text-slate-500">
                  No items listed for this order.
                </div>
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* 3. CUSTOMER NAME AND NUMBER IN STACK                        */}
          {/* ============================================================ */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Customer Details
            </span>

            {/* Vertical Stack: Customer Name on top, Number below */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
              {/* Customer Name */}
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold uppercase tracking-wider">
                    Customer Name
                  </span>
                  <span className="font-black text-slate-900 text-sm">
                    {order.customerName || 'Customer'}
                  </span>
                </div>
              </div>

              {/* Customer Number (Stacked directly below) */}
              <div className="flex items-center gap-2.5 pt-2 border-t border-slate-200/60">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold uppercase tracking-wider">
                    Customer Number
                  </span>
                  <span className="font-black text-slate-900 text-sm tracking-wide font-mono">
                    {order.phone ? `+91 ${order.phone.replace(/^\+?91/, '')}` : 'Not provided'}
                  </span>
                </div>
              </div>

              {/* Delivery Address (Stacked right under) */}
              {order.address && (
                <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200/60">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-semibold uppercase tracking-wider">
                      Delivery Destination
                    </span>
                    <span className="font-medium text-slate-800 text-xs leading-relaxed block">
                      {order.address}
                      {order.area ? `, ${order.area}` : ''}
                      {order.pincode ? ` – ${order.pincode}` : ''}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* 4. PRICE SUMMARY (No editable fields, display only)         */}
          {/* ============================================================ */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Price Summary
            </span>

            <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2.5 shadow-md">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Items Subtotal</span>
                <span className="font-semibold text-white">
                  ₹{itemsSubtotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between text-xs text-slate-300">
                <span>Express 60-min Delivery</span>
                <span className="font-semibold text-emerald-400">
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>

              {handlingFee > 0 && (
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Handling / Packaging</span>
                  <span className="font-semibold text-white">₹{handlingFee}</span>
                </div>
              )}

              {discount > 0 && (
                <div className="flex justify-between text-xs text-emerald-400">
                  <span>Discount Applied</span>
                  <span className="font-semibold">−₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                <div>
                  <span className="font-extrabold text-sm text-white block">Grand Total</span>
                  <span className="text-[10px] text-slate-400">
                    Payment Mode:{' '}
                    <strong className="text-amber-400 uppercase">
                      {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online / UPI'}
                    </strong>
                  </span>
                </div>
                <span className="text-lg sm:text-xl font-black text-amber-400">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
