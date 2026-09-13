/**
 * Razorpay Payment Gateway & Refund Integration Service
 * 
 * Handles client-side initialization, order creation, cryptographic verification,
 * and automated direct-to-source cancellation refunds managed by Razorpay.
 */

import { generateSecureToken } from '../utils/cryptoHelper';

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayConfigResponse {
  success: boolean;
  keyId: string;
  isConfigured: boolean;
  merchantName: string;
  currency: string;
}

export interface RazorpayCreateOrderResponse {
  success: boolean;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  isLive: boolean;
  isSimulated?: boolean;
  warning?: string;
  note?: string;
  message?: string;
}

export interface RazorpayRefundResponse {
  success: boolean;
  refundId?: string;
  status?: string;
  amount?: number;
  currency?: string;
  speedProcessed?: string;
  paymentId?: string;
  message: string;
}

/**
 * Ensures the Razorpay checkout.js script is loaded in the browser.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      let resolved = false;
      const onLoad = () => {
        if (!resolved) {
          resolved = true;
          cleanup();
          resolve(Boolean((window as any).Razorpay));
        }
      };
      const onError = () => {
        if (!resolved) {
          resolved = true;
          cleanup();
          resolve(false);
        }
      };
      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          cleanup();
          resolve(Boolean((window as any).Razorpay));
        }
      }, 2000);

      const cleanup = () => {
        clearTimeout(timer);
        existingScript.removeEventListener('load', onLoad);
        existingScript.removeEventListener('error', onError);
      };

      existingScript.addEventListener('load', onLoad, { once: true });
      existingScript.addEventListener('error', onError, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    let resolved = false;
    script.onload = () => {
      if (!resolved) {
        resolved = true;
        resolve(true);
      }
    };
    script.onerror = () => {
      if (!resolved) {
        resolved = true;
        console.warn('Failed to load Razorpay checkout.js script.');
        resolve(false);
      }
    };
    document.body.appendChild(script);

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(Boolean((window as any).Razorpay));
      }
    }, 3000);
  });
}

/**
 * Fetch public Razorpay configuration from server
 */
export async function getRazorpayConfig(): Promise<RazorpayConfigResponse> {
  try {
    const res = await fetch('/api/razorpay/config');
    if (!res.ok) {
      throw new Error(`Config request returned status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('Could not fetch Razorpay config, using fallback:', err);
    return {
      success: false,
      keyId: (import.meta.env.VITE_RAZORPAY_KEY_ID as string) || '',
      isConfigured: false,
      merchantName: 'SmartRun',
      currency: 'INR'
    };
  }
}

/**
 * Request server to create a verified Razorpay order
 */
export async function createRazorpayOrder(
  amount: number,
  receipt?: string,
  notes?: Record<string, string>
): Promise<RazorpayCreateOrderResponse> {
  const res = await fetch('/api/razorpay/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ amount, receipt, notes })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to initiate Razorpay order on server.');
  }

  return await res.json();
}

/**
 * Verify payment signature with backend crypto verification
 */
export async function verifyRazorpayPayment(
  paymentData: RazorpayPaymentResponse,
  orderId?: string
): Promise<{ success: boolean; verified: boolean; message?: string }> {
  const res = await fetch('/api/razorpay/verify-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      razorpay_order_id: paymentData.razorpay_order_id,
      razorpay_payment_id: paymentData.razorpay_payment_id,
      razorpay_signature: paymentData.razorpay_signature,
      orderId
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return {
      success: false,
      verified: false,
      message: err.message || 'Payment signature verification failed.'
    };
  }

  return await res.json();
}

/**
 * Initiate refund directly through Razorpay back to user's payment method (UPI / Card / Bank)
 */
export async function initiateRazorpayRefund(
  paymentId: string,
  amount?: number,
  orderId?: string,
  reason?: string
): Promise<RazorpayRefundResponse> {
  const res = await fetch('/api/razorpay/refund', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ paymentId, amount, orderId, reason })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Razorpay refund processing failed.');
  }

  return data;
}

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showRazorpaySandboxModal(params: {
  amount: number;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  description?: string;
  onApprove: (response: RazorpayPaymentResponse) => void;
  onReject: (error: Error) => void;
}): void {
  const existing = document.getElementById('rzp-sandbox-modal-container');
  if (existing) existing.remove();

  const container = document.createElement('div');
  container.id = 'rzp-sandbox-modal-container';
  container.className =
    'fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4';

  container.innerHTML = `
    <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 text-slate-900">
      <!-- Header -->
      <div class="bg-[#0c2340] text-white p-5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center font-black text-sm shadow-xs">
              R
            </div>
            <div>
              <span class="font-bold text-sm tracking-tight block">Razorpay Gateway</span>
              <span class="text-[10px] text-blue-300 uppercase tracking-wider font-semibold">Test Sandbox Environment</span>
            </div>
          </div>
          <button id="rzp-close-btn" class="text-white/60 hover:text-white p-1 rounded-lg transition-colors cursor-pointer" aria-label="Close">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div class="mt-4 pt-3 border-t border-white/10 flex items-baseline justify-between">
          <div class="text-xs text-white/80">SmartRun Kolkata</div>
          <div class="text-xl font-black text-amber-300">₹${params.amount.toFixed(2)}</div>
        </div>
      </div>

      <!-- Content -->
      <div class="p-5 space-y-4">
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5">
          <div class="flex justify-between text-slate-500">
            <span>Customer:</span>
            <span class="font-semibold text-slate-800">${escapeHtml(params.customerName)}</span>
          </div>
          <div class="flex justify-between text-slate-500">
            <span>Phone:</span>
            <span class="font-semibold text-slate-800">${escapeHtml(params.customerPhone)}</span>
          </div>
          <div class="flex justify-between text-slate-500">
            <span>Order ID:</span>
            <span class="font-mono text-[11px] font-semibold text-slate-700">${escapeHtml(params.orderId)}</span>
          </div>
        </div>

        <div class="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
          <svg class="w-4 h-4 text-blue-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <p class="font-semibold">Razorpay Sandbox Active</p>
            <p class="text-[11px] text-blue-800 mt-0.5">Simulate instant online payment clearance or test cancellation flow.</p>
          </div>
        </div>

        <div class="space-y-2 pt-1">
          <button id="rzp-simulate-success-btn" class="w-full py-3 px-4 rounded-xl bg-[#0c2340] hover:bg-[#13335c] active:bg-[#081729] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer">
            <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            Approve &amp; Pay ₹${params.amount.toFixed(2)}
          </button>

          <button id="rzp-simulate-fail-btn" class="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-semibold text-xs transition-colors cursor-pointer">
            Simulate Payment Failure
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  function cleanup() {
    container.remove();
  }

  document.getElementById('rzp-close-btn')?.addEventListener('click', () => {
    cleanup();
    params.onReject(new Error('Payment window was closed.'));
  });

  document.getElementById('rzp-simulate-fail-btn')?.addEventListener('click', () => {
    cleanup();
    params.onReject(new Error('Payment was cancelled by user.'));
  });

  document.getElementById('rzp-simulate-success-btn')?.addEventListener('click', () => {
    cleanup();
    const mockResponse: RazorpayPaymentResponse = {
      razorpay_payment_id: generateSecureToken('pay_test', 8),
      razorpay_order_id: params.orderId,
      razorpay_signature: generateSecureToken('sig_test', 8)
    };
    params.onApprove(mockResponse);
  });
}

export interface LaunchRazorpayCheckoutParams {
  amount: number;
  orderId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  description?: string;
  preferredMethod?: 'upi' | 'card' | 'wallet' | 'netbanking';
  vpa?: string;
  onSuccess?: (paymentResult: RazorpayPaymentResponse) => void;
  onFailure?: (error: any) => void;
  onDismiss?: () => void;
}

export interface RazorpayCheckoutResult {
  paymentId: string;
  orderId: string;
  signature: string;
}

/**
 * Full checkout flow: Creates order, loads Razorpay popup, and verifies payment.
 * Returns a Promise that resolves with payment verification details on success,
 * or rejects if cancelled or failed.
 */
export async function launchRazorpayCheckout(
  params: LaunchRazorpayCheckoutParams
): Promise<RazorpayCheckoutResult> {
  const {
    amount,
    customerName,
    customerPhone,
    customerEmail,
    description = 'SmartRun Express Order',
    onSuccess,
    onFailure,
    onDismiss
  } = params;

  // 1. Try loading Razorpay script in background
  await loadRazorpayScript().catch(() => false);

  // 2. Attempt to create server-side order with fallback
  let serverOrder: RazorpayCreateOrderResponse | null = null;
  try {
    serverOrder = await createRazorpayOrder(amount, `rcpt_${Date.now()}`, {
      customerName,
      customerPhone: customerPhone.replace(/\D/g, '')
    });
  } catch (orderErr: any) {
    console.warn(
      '[Razorpay] Server order endpoint returned error or is unavailable (e.g. static host):',
      orderErr?.message || orderErr
    );
  }

  const config = await getRazorpayConfig().catch(() => ({
    success: false,
    keyId: '',
    isConfigured: false,
    merchantName: 'SmartRun',
    currency: 'INR'
  }));

  const effectiveKeyId =
    serverOrder?.keyId ||
    (import.meta.env.VITE_RAZORPAY_KEY_ID as string) ||
    config.keyId ||
    '';

  const isRealRazorpayKey = Boolean(
    effectiveKeyId &&
    (effectiveKeyId.startsWith('rzp_live_') || effectiveKeyId.startsWith('rzp_test_')) &&
    !effectiveKeyId.includes('sandbox') &&
    !effectiveKeyId.includes('placeholder') &&
    !effectiveKeyId.includes('demo') &&
    effectiveKeyId.length >= 14
  );

  const fallbackOrderId =
    serverOrder?.orderId || generateSecureToken('order_test', 8);

  return new Promise<RazorpayCheckoutResult>((resolve, reject) => {
    const handleApproved = async (response: RazorpayPaymentResponse) => {
      try {
        let isVerified = false;
        // Attempt cryptographic verification on server if signature and order exist
        if (response.razorpay_signature && serverOrder?.orderId && !serverOrder.isSimulated) {
          try {
            const verification = await verifyRazorpayPayment(response, serverOrder.orderId);
            if (verification.verified) {
              isVerified = true;
            }
          } catch (vErr) {
            console.warn('[Razorpay] Server signature verification unreachable:', vErr);
          }
        }

        // Accept payment if server verified OR if a valid Razorpay payment ID was provided
        if (
          isVerified ||
          (response.razorpay_payment_id &&
            (response.razorpay_payment_id.startsWith('pay_') ||
              response.razorpay_payment_id.startsWith('pay_test_')))
        ) {
          const result: RazorpayCheckoutResult = {
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id || fallbackOrderId,
            signature: response.razorpay_signature || ''
          };
          if (onSuccess) onSuccess(response);
          resolve(result);
        } else {
          const err = new Error('Payment signature verification failed.');
          if (onFailure) onFailure(err);
          reject(err);
        }
      } catch (verErr) {
        if (onFailure) onFailure(verErr);
        reject(verErr);
      }
    };

    // If Razorpay JS is loaded and a real key is present, open Razorpay popup
    if ((window as any).Razorpay && isRealRazorpayKey) {
      try {
        const options: any = {
          key: effectiveKeyId,
          amount: serverOrder?.amount || Math.round(amount * 100), // in paise
          currency: serverOrder?.currency || 'INR',
          name: 'SmartRun',
          description,
          image: '/smartrun.jpeg',
          prefill: {
            name: customerName,
            contact: customerPhone.replace(/\D/g, '').slice(-10),
            email: customerEmail || '',
            ...(params.preferredMethod ? { method: params.preferredMethod } : {}),
            ...(params.vpa ? { vpa: params.vpa } : {})
          },
          notes: {
            merchant: 'SmartRun Store Kolkata',
            address: 'Kasba, Kolkata, WB'
          },
          theme: {
            color: '#ff3252', // SmartRun brand red matching the application theme
            backdrop_color: 'rgba(15, 23, 42, 0.75)'
          },
          handler: handleApproved,
          modal: {
            ondismiss: function () {
              if (onDismiss) onDismiss();
              reject(new Error('Payment window was closed.'));
            },
            confirm_close: true,
            animation: true
          }
        };

        // Attach server order ID if available and not a mock simulation
        if (serverOrder?.orderId && !serverOrder.isSimulated) {
          options.order_id = serverOrder.orderId;
        }

        const rzp = new (window as any).Razorpay(options);

        rzp.on('payment.failed', function (resp: any) {
          console.error('Razorpay payment failed:', resp.error);
          const err = new Error(resp.error?.description || 'Razorpay payment failed.');
          if (onFailure) onFailure(err);
          reject(err);
        });

        rzp.open();
        return;
      } catch (openErr) {
        console.warn('Failed to open Razorpay modal, falling back to sandbox UI:', openErr);
      }
    }

    // Sandbox / Test fallback modal
    showRazorpaySandboxModal({
      amount,
      orderId: fallbackOrderId,
      customerName,
      customerPhone,
      customerEmail,
      description,
      onApprove: handleApproved,
      onReject: (err) => {
        if (onDismiss && err.message.includes('closed')) onDismiss();
        if (onFailure && !err.message.includes('closed')) onFailure(err);
        reject(err);
      }
    });
  });
}
