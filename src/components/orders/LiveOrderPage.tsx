import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bike,
  User,
  Phone,
  Package,
  Clock,
  MapPin,
  Warehouse,
  Home,
  CheckCircle2,
  ShoppingBag
} from 'lucide-react';
import { Order } from '../../types';
import { KOLKATA_AREAS } from '../../data/kolkataAreas';
import { LiveOrderRealMap } from './LiveOrderRealMap';

// Giriraj Power Kasba Central Warehouse Exact Coordinates
const WAREHOUSE_LOCATION = {
  name: 'Giriraj Power Warehouse',
  area: 'Kasba Industrial Estate, Kolkata',
  lat: 22.5186,
  lng: 88.3832
};

interface LiveOrderPageProps {
  order?: Order | null;
  orders?: Order[];
  onBack?: () => void;
}

export const LiveOrderPage: React.FC<LiveOrderPageProps> = ({
  order: propOrder,
  orders = [],
  onBack
}) => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId?: string }>();

  // Resolve target order:
  // 1. By URL param orderId
  // 2. From propOrder
  // 3. From first active order in orders
  const order = useMemo(() => {
    if (orderId && orders.length > 0) {
      const found = orders.find(
        (o) => o.id === orderId || o.id?.toLowerCase().endsWith(orderId.toLowerCase())
      );
      if (found) return found;
    }
    if (propOrder) return propOrder;
    if (orders.length > 0) {
      const active = orders.filter(
        (o) => o.status !== 'delivered' && o.status !== 'cancelled' && o.status !== 'failed'
      );
      if (active.length > 0) {
        return [...active].sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        )[0];
      }
      return orders[0];
    }
    return null;
  }, [orderId, propOrder, orders]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // If history exists, go back, else home
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/orders');
      }
    }
  };

  // Determine stage progression:
  const status = (order?.status || 'pending').toLowerCase();
  const rawPartner = (order as any)?.delivery?.delivery_partner || (order as any)?.deliveryPartner;
  const isConfirmed = Boolean(order);
  const isPartnerAssigned =
    Boolean(rawPartner?.name || rawPartner) ||
    status === 'out_for_delivery' ||
    status === 'shipped' ||
    status === 'near_destination' ||
    status === 'delivered';
  const isOutForDelivery =
    status === 'out_for_delivery' ||
    status === 'near_destination' ||
    status === 'delivered';

  // Extract Exact User Delivery Coordinates from order / area / address
  const userLocation = useMemo(() => {
    if (!order) {
      return {
        name: 'Kolkata',
        area: 'Kolkata Delivery Point',
        lat: 22.5744,
        lng: 88.3547
      };
    }

    // 1. Coordinates explicitly stored on order
    if ((order as any).lat && (order as any).lng) {
      return {
        name: order.area || 'User Location',
        area: order.area || 'Delivery Destination',
        lat: Number((order as any).lat),
        lng: Number((order as any).lng)
      };
    }
    if ((order as any).shippingAddress?.lat && (order as any).shippingAddress?.lng) {
      return {
        name: order.area || 'User Location',
        area: order.area || 'Delivery Destination',
        lat: Number((order as any).shippingAddress.lat),
        lng: Number((order as any).shippingAddress.lng)
      };
    }

    // 2. Match by exact or partial Kolkata Area name
    if (order.area) {
      const match = KOLKATA_AREAS.find(
        (a) =>
          a.name.toLowerCase().includes(order.area!.toLowerCase()) ||
          order.area!.toLowerCase().includes(a.name.toLowerCase().split('/')[0].trim())
      );
      if (match) {
        return {
          name: match.name.split('/')[0].trim(),
          area: match.exactStreet || match.name,
          lat: match.lat,
          lng: match.lng
        };
      }
    }

    // 3. Match by address text against known areas
    if (order.address) {
      const addrLower = order.address.toLowerCase();
      const match = KOLKATA_AREAS.find((a) => {
        const parts = a.name.toLowerCase().split('/');
        return parts.some((p) => addrLower.includes(p.trim()));
      });
      if (match) {
        return {
          name: match.name.split('/')[0].trim(),
          area: match.exactStreet || match.name,
          lat: match.lat,
          lng: match.lng
        };
      }

      // 4. Match by 6-digit PIN code in address
      const pinMatch = order.address.match(/\b(700\d{3}|711\d{3})\b/);
      if (pinMatch) {
        const pinArea = KOLKATA_AREAS.find((a) => a.pincode === pinMatch[1]);
        if (pinArea) {
          return {
            name: pinArea.name.split('/')[0].trim(),
            area: pinArea.exactStreet || pinArea.name,
            lat: pinArea.lat,
            lng: pinArea.lng
          };
        }
      }
    }

    // Default Fallback: Central Kolkata
    return {
      name: order.area || 'Kolkata',
      area: 'Kolkata Delivery Point',
      lat: 22.5744,
      lng: 88.3547
    };
  }, [order]);

  // Compute distance between Warehouse and User Location (Haversine formula in KM)
  const deliveryDistanceKm = useMemo(() => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const dLat = toRad(userLocation.lat - WAREHOUSE_LOCATION.lat);
    const dLng = toRad(userLocation.lng - WAREHOUSE_LOCATION.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(WAREHOUSE_LOCATION.lat)) *
        Math.cos(toRad(userLocation.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.max(1.2, Math.round(6371 * c * 10) / 10);
  }, [userLocation]);

  const mapDestination = useMemo(() => ({
    lat: userLocation.lat,
    lng: userLocation.lng,
    name: userLocation.name,
    area: order?.area || userLocation.name
  }), [userLocation.lat, userLocation.lng, userLocation.name, order?.area]);

  // Subtotal & Financial calculations
  const itemsSubtotal = order
    ? order.subtotal ||
      order.itemTotal ||
      (order.items || []).reduce((sum, item) => {
        const price = item.product?.price || 0;
        return sum + price * (item.quantity || 1);
      }, 0)
    : 0;

  const deliveryFee = order?.deliveryFee ?? 0;
  const handlingFee = order?.handlingFee ?? ((order as any)?.fees ?? 0);
  const discount = order?.discount ?? ((order as any)?.discountAmount ?? 0);
  const totalAmount = order?.totalAmount || itemsSubtotal + deliveryFee + handlingFee - discount;

  const orderNumber =
    order?.id && order.id.length > 8 ? order.id.slice(-6).toUpperCase() : order?.id || 'ORDER';

  // Delivery partner name extracted directly from backend order
  const deliveryPartnerName = useMemo(() => {
    return (
      (order as any)?.delivery?.delivery_partner?.name ||
      (order as any)?.deliveryPartner?.name ||
      (order as any)?.delivery_partner_name ||
      (order as any)?.assignedTo ||
      ''
    );
  }, [order]);

  // Extract initial rider GPS coordinates from backend order payload if present
  const initialRiderLocation = useMemo(() => {
    if (!order) return null;
    if (order.riderLocation && typeof order.riderLocation.lat === 'number') {
      return order.riderLocation;
    }
    const anyOrder = order as any;
    if (anyOrder.rider_location && typeof anyOrder.rider_location.lat === 'number') {
      return anyOrder.rider_location;
    }
    if (anyOrder.delivery?.rider_location && typeof anyOrder.delivery.rider_location.lat === 'number') {
      return anyOrder.delivery.rider_location;
    }
    if (anyOrder.delivery?.current_location && typeof anyOrder.delivery.current_location.lat === 'number') {
      return anyOrder.delivery.current_location;
    }
    if (anyOrder.deliveryPartner?.current_location && typeof anyOrder.deliveryPartner.current_location.lat === 'number') {
      return anyOrder.deliveryPartner.current_location;
    }
    if (typeof anyOrder.deliveryPartner?.lat === 'number' && typeof anyOrder.deliveryPartner?.lng === 'number') {
      return { lat: anyOrder.deliveryPartner.lat, lng: anyOrder.deliveryPartner.lng };
    }
    return null;
  }, [order]);

  const [liveRiderLocation, setLiveRiderLocation] = useState<{
    lat: number;
    lng: number;
    heading?: number;
    speed?: number;
    updatedAt?: string;
  } | null>(initialRiderLocation);

  // Synchronize when initial order data updates
  useEffect(() => {
    if (initialRiderLocation) {
      setLiveRiderLocation(initialRiderLocation);
    }
  }, [initialRiderLocation]);

  // Real-time backend GPS fetching: polls the backend endpoint for live coordinates
  useEffect(() => {
    if (!order?.id) return;
    const isFinished = order.status === 'delivered' || order.status === 'cancelled' || order.status === 'failed';
    if (isFinished) return;

    let isMounted = true;
    const fetchBackendRiderLocation = async () => {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(order.id)}/rider-location`);
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data && data.success && data.location && typeof data.location.lat === 'number') {
          setLiveRiderLocation(data.location);
        }
      } catch {
        // Silent background polling
      }
    };

    fetchBackendRiderLocation();

    // Poll every 7 seconds while active
    const pollTimer = setInterval(fetchBackendRiderLocation, 7000);
    return () => {
      isMounted = false;
      clearInterval(pollTimer);
    };
  }, [order?.id, order?.status]);

  // Single Status Pill display above the map (driven directly by backend order status)
  const statusPill = useMemo(() => {
    if (!order) {
      return {
        label: 'Order Processing',
        bgClass: 'bg-emerald-50 text-emerald-800',
        borderClass: 'border-emerald-200',
        dotClass: 'bg-emerald-600',
        hasPulse: true
      };
    }

    const st = (order.status || 'pending').toLowerCase();
    const partnerName = deliveryPartnerName;

    if (st === 'delivered') {
      return {
        label: 'Order Delivered',
        bgClass: 'bg-emerald-100 text-emerald-900',
        borderClass: 'border-emerald-300',
        dotClass: 'bg-emerald-600',
        hasPulse: false
      };
    }

    if (st === 'cancelled' || st === 'failed') {
      return {
        label: 'Order Cancelled',
        bgClass: 'bg-rose-100 text-rose-900',
        borderClass: 'border-rose-300',
        dotClass: 'bg-rose-600',
        hasPulse: false
      };
    }

    if (st === 'out_for_delivery' || st === 'near_destination') {
      return {
        label: partnerName ? `Out for Delivery (${partnerName})` : 'Out for Delivery',
        bgClass: 'bg-emerald-600 text-white',
        borderClass: 'border-emerald-700',
        dotClass: 'bg-white',
        hasPulse: true
      };
    }

    if (isPartnerAssigned || (order as any)?.delivery?.status === 'assigned') {
      return {
        label: partnerName ? `Delivery Boy Assigned (${partnerName})` : 'Delivery Boy Assigned',
        bgClass: 'bg-blue-600 text-white',
        borderClass: 'border-blue-700',
        dotClass: 'bg-white',
        hasPulse: true
      };
    }

    if (
      st === 'packing' ||
      st === 'packed' ||
      st === 'packaging' ||
      order.packed_at ||
      (order as any).packedAt
    ) {
      return {
        label: 'Order Packaging',
        bgClass: 'bg-amber-500 text-white',
        borderClass: 'border-amber-600',
        dotClass: 'bg-white',
        hasPulse: true
      };
    }

    if (st === 'confirmed' || st === 'accepted' || order.confirmed_at || (order as any).confirmedAt) {
      return {
        label: 'Order Confirmed',
        bgClass: 'bg-indigo-600 text-white',
        borderClass: 'border-indigo-700',
        dotClass: 'bg-white',
        hasPulse: true
      };
    }

    return {
      label: 'Order Placed',
      bgClass: 'bg-slate-800 text-white',
      borderClass: 'border-slate-900',
      dotClass: 'bg-emerald-400',
      hasPulse: true
    };
  }, [order, isPartnerAssigned]);

  // Empty state if no order is found
  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
        <div className="sticky top-0 z-30 bg-white px-4 py-3 sm:py-4 flex items-center justify-between shadow-xs">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-sm px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-base font-black text-slate-900">Order</h1>
          <div className="w-16" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-black text-slate-900 mb-2">No Active Live Order</h2>
          <p className="text-sm text-slate-500 mb-6">
            You don't have an order currently in transit. Placed orders with express delivery will appear here live.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={() => navigate('/orders')}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors cursor-pointer"
            >
              View Order History
            </button>
            <button
              onClick={() => navigate('/electrical')}
              className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Catalog</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Sticky Header for Order Page (Borderless, Renamed to Order) */}
      <div className="sticky top-0 z-30 bg-white px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            aria-label="Go back"
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Order
              </h1>
              <span className="text-xs font-mono font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                #{orderNumber}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Real-time delivery progress &amp; route
            </p>
          </div>
        </div>
      </div>

      {/* Status Pill Display (Only one pill, centered in the middle of display above map, showing packaging, delivery boy assigned, etc. from backend) */}
      <div className="w-full flex justify-center items-center py-2.5 sm:py-3 px-4 bg-slate-50 border-b border-slate-200/60">
        <div
          className={`inline-flex items-center gap-2 px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-xs transition-all duration-300 ${statusPill.bgClass} border ${statusPill.borderClass}`}
        >
          {statusPill.hasPulse && (
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusPill.dotClass}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${statusPill.dotClass}`} />
            </span>
          )}
          <span>{statusPill.label}</span>
        </div>
      </div>

      {/* Borderless Real Map touching both sides of the screen edge-to-edge */}
      <div className="w-full border-b border-slate-200/80 overflow-hidden bg-slate-100">
        <LiveOrderRealMap
          warehouse={WAREHOUSE_LOCATION}
          destination={mapDestination}
          distanceKm={deliveryDistanceKm}
          isOutForDelivery={isOutForDelivery}
          isPartnerAssigned={isPartnerAssigned}
          riderLocation={liveRiderLocation}
          deliveryPartnerName={deliveryPartnerName}
        />
      </div>

      {/* Main Page Body (Clean separate section layout, no double box nesting) */}
      <main className="flex-1 w-full max-w-2xl mx-auto p-4 sm:p-6 pb-20 sm:pb-12">
        {/* Container identified with live-order-details-modal for seamless targeting */}
        <div id="live-order-details-modal" className="space-y-4 sm:space-y-5">
          {/* Delivery Destination Box (Moved below map and above order items) */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black shrink-0">
                <Bike className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Delivery Destination
                </span>
                <span className="text-sm font-black text-slate-900">
                  {order.area || userLocation.name}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 font-medium block">ETA Window</span>
              <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1 justify-end">
                <Clock className="w-3.5 h-3.5" />
                30-60 Mins Express
              </span>
            </div>
          </div>

          {/* 2. ORDER DETAILS (Items list directly in clean card) */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Order Items ({order.items?.length || 0})
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Price
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => {
                  const unitPrice = item.product?.price || 0;
                  const itemTotalPrice = unitPrice * (item.quantity || 1);
                  const color = item.selectedColor || (item.product as any)?.selectedColor;

                  return (
                    <div
                      key={idx}
                      className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.product?.image ? (
                          <img
                            src={item.product.image}
                            alt=""
                            className="w-11 h-11 object-contain bg-slate-50 rounded-lg p-1 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
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

          {/* 3. CUSTOMER DETAILS (Separate Card) */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Customer Details
            </span>

            <div className="space-y-3">
              {/* Customer Name */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Customer Name
                  </span>
                  <span className="font-black text-slate-900 text-sm truncate block">
                    {(order as any).userName || order.customerName || order.recipientName || 'Customer'}
                  </span>
                </div>
              </div>

              {/* Customer Phone Number */}
              <div className="flex items-center gap-3 pt-2.5 border-t border-slate-100">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Contact Number
                  </span>
                  <span className="font-mono font-bold text-slate-800 text-xs sm:text-sm">
                    {(order as any).userPhone || order.phone || order.recipientPhone || 'Not provided'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. PRICE SUMMARY (Separate Card) */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Price Summary
            </span>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-slate-900">
                  ₹{itemsSubtotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Express Delivery Fee:</span>
                <span className="font-semibold text-emerald-700">
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toLocaleString('en-IN')}`}
                </span>
              </div>

              {handlingFee > 0 && (
                <div className="flex items-center justify-between text-slate-600">
                  <span>Handling &amp; Packaging:</span>
                  <span className="font-semibold text-slate-900">
                    ₹{handlingFee.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              {discount > 0 && (
                <div className="flex items-center justify-between text-emerald-700">
                  <span>Coupon / Discount:</span>
                  <span className="font-semibold">
                    -₹{discount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between font-black text-slate-900 text-sm sm:text-base">
                <span>Grand Total:</span>
                <span className="text-emerald-700">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
