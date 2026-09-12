import { generateSecureToken } from './cryptoHelper';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export function showToast(message: string, type: ToastType = 'info', duration = 3500): void {
  if (typeof window === 'undefined') return;
  const id = generateSecureToken('toast', 6);
  const event = new CustomEvent<ToastMessage>('giriraj_show_toast', {
    detail: { id, message, type, duration }
  });
  window.dispatchEvent(event);
}
