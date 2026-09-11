import React from 'react';
import { useLocation } from 'react-router-dom';
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
  const location = useLocation();

  // Condition: Only show when order exists, NOT on profile, live-order, or cart pages, and NOT yet delivered or cancelled/failed
  if (
    !order ||
    location.pathname.startsWith('/profile') ||
    location.pathname.startsWith('/live-order') ||
    location.pathname.startsWith('/cart') ||
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
        {/* Clean Static Map Graphic with Road Grid & Delivery Path */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Base map terrain (Clean White / Light Canvas) */}
          <rect width="100" height="100" fill="#ffffff" />

          {/* Secondary background road network (Light gray roads) */}
          <path
            d="M 0 32 Q 45 42 100 22"
            stroke="#f1f5f9"
            strokeWidth="5"
            fill="none"
          />
          <path
            d="M 30 0 Q 38 55 24 100"
            stroke="#f1f5f9"
            strokeWidth="4"
            fill="none"
          />
          <path
            d="M 0 78 Q 50 68 100 84"
            stroke="#f1f5f9"
            strokeWidth="4"
            fill="none"
          />
          <path
            d="M 76 0 Q 68 50 82 100"
            stroke="#f1f5f9"
            strokeWidth="3.5"
            fill="none"
          />

          {/* Delivery Route Path (Clean Static Line) */}
          <path
            d="M 20 80 C 32 48, 48 64, 80 22"
            stroke="#059669"
            strokeWidth="3"
            strokeDasharray="5 3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Store Origin (Amber marker) */}
          <circle cx="20" cy="80" r="4" fill="#f59e0b" />
          <circle cx="20" cy="80" r="1.5" fill="#ffffff" />

          {/* Destination Delivery Pin (Emerald marker) */}
          <circle cx="80" cy="22" r="5" fill="#059669" />
          <circle cx="80" cy="22" r="2" fill="#ffffff" />

          {/* Static Route Position Marker (No ping effect) */}
          <circle cx="48" cy="54" r="4.5" fill="#059669" stroke="#ffffff" strokeWidth="1.5" />
        </svg>

        {/* Clean Static Indicator Dot at top right (No ping effect) */}
        <span className="absolute top-1 right-1 flex h-2 w-2 pointer-events-none">
          <span className="inline-flex rounded-full h-2 w-2 bg-emerald-500 border border-white" />
        </span>

        {/* Home Pin Icon at destination */}
        <div className="absolute top-1 right-1.5 pointer-events-none">
          <MapPin className="w-2.5 h-2.5 text-emerald-700" />
        </div>
      </button>
    </div>
  );
};
