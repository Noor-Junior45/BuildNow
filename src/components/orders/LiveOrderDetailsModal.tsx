import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order } from '../../types';
import { LiveOrderPage } from './LiveOrderPage';

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
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      navigate('/live-order');
      onClose();
    }
  }, [isOpen, navigate, onClose]);

  if (!isOpen || !order) return null;

  // Full page view fallback across all devices (no popup, no dark backdrop overlay)
  return (
    <div className="fixed inset-0 z-50 bg-slate-50 overflow-y-auto">
      <LiveOrderPage order={order} onBack={onClose} />
    </div>
  );
};
