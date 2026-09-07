import React from 'react';
import { MapPin } from 'lucide-react';
import { Order } from '../../types';

interface FloatingLiveOrderButtonProps {
  order: Order | null;
  onClick: () => void;
}

export const FloatingLiveOrderButton: React.FC<FloatingLiveOrderButtonProps> = ({
  order,
  onClick
}) => {
  // Condition: Only show when order exists and is NOT yet delivered or cancelled/failed
  if (
    !order ||
    order.status === 'delivered' ||
    order.status === 'cancelled' ||
    order.status === 'failed'
  ) {
    return null;
  }

  return (
    <div
      id="floating-live-order-tracker"
      className="fixed bottom-24 sm:bottom-26 right-4 sm:right-5 z-40 flex flex-col items-center select-none animate-in fade-in zoom-in duration-300"
    >
      {/* Compact Circular Map Path Button (White Theme with White Border) */}
      <button
        type="button"
        id="live-order-map-circle-btn"
        onClick={onClick}
        aria-label="View current live order tracking and details"
        className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-white border-2 border-white shadow-xl shadow-slate-900/25 hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer group focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
      >
        {/* Animated Map Graphic with Road Grid & Delivery Path (Clean Light/White Map) */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Base map terrain (White / Light Canvas) */}
          <rect width="100" height="100" fill="#f8fafc" />

          {/* Secondary background road network (Light gray roads) */}
          <path
            d="M 0 32 Q 45 42 100 22"
            stroke="#e2e8f0"
            strokeWidth="5"
            fill="none"
          />
          <path
            d="M 30 0 Q 38 55 24 100"
            stroke="#e2e8f0"
            strokeWidth="4"
            fill="none"
          />
          <path
            d="M 0 78 Q 50 68 100 84"
            stroke="#e2e8f0"
            strokeWidth="4"
            fill="none"
          />
          <path
            d="M 76 0 Q 68 50 82 100"
            stroke="#e2e8f0"
            strokeWidth="3.5"
            fill="none"
          />

          {/* Main Delivery Route Highway (Glow layer on light background) */}
          <path
            d="M 20 80 C 32 48, 48 64, 80 22"
            stroke="#d1fae5"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />

          {/* Solid Route Path with moving emerald dashes */}
          <path
            d="M 20 80 C 32 48, 48 64, 80 22"
            stroke="#059669"
            strokeWidth="3.2"
            strokeDasharray="5 3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Store Origin (Amber marker with crisp white center) */}
          <circle cx="20" cy="80" r="4.5" fill="#f59e0b" />
          <circle cx="20" cy="80" r="1.8" fill="#ffffff" />

          {/* Destination Delivery Pin (Emerald marker with crisp white center) */}
          <circle cx="80" cy="22" r="5.5" fill="#059669" />
          <circle cx="80" cy="22" r="2.2" fill="#ffffff" />

          {/* Active transit tracking pulse on route */}
          <circle cx="48" cy="54" r="13" fill="#10b981" fillOpacity="0.22" className="animate-ping" />
          <circle cx="48" cy="54" r="5" fill="#059669" stroke="#ffffff" strokeWidth="1.5" />
        </svg>

        {/* Live Indicator Dot at top right */}
        <span className="absolute top-1 right-1 flex h-2.5 w-2.5 pointer-events-none">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white" />
        </span>

        {/* Tiny Home Pin Icon at destination */}
        <div className="absolute top-1.5 right-1.5 pointer-events-none">
          <MapPin className="w-2.5 h-2.5 text-emerald-700 drop-shadow-xs" />
        </div>
      </button>
    </div>
  );
};
