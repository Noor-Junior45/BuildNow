/**
 * Razorpay Payment Gateway & Refund Integration Service
 * 
 * Handles client-side initialization, order creation, cryptographic verification,
 * and automated direct-to-source cancellation refunds managed by Razorpay.
 */

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
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Razorpay checkout.js script.');
      resolve(false);
    };
    document.body.appendChild(script);
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
      keyId: (import.meta.env.VITE_RAZORPAY_KEY_ID as string) || 'rzp_test_demo',
      isConfigured: false,
      merchantName: 'Giriraj Power',
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

export interface LaunchRazorpayCheckoutParams {
  amount: number;
  orderId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  description?: string;
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
    description = 'Giriraj Power Kolkata Express Order',
    onSuccess,
    onFailure,
    onDismiss
  } = params;

  // 1. Ensure Razorpay script is loaded
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded && !(window as any).Razorpay) {
    throw new Error('Razorpay checkout SDK could not be loaded. Please check your network connection.');
  }

  // 2. Create server-side order
  const serverOrder = await createRazorpayOrder(amount, `rcpt_${Date.now()}`, {
    customerName,
    customerPhone: customerPhone.replace(/\D/g, '')
  });

  const config = await getRazorpayConfig();
  const effectiveKeyId = serverOrder.keyId || config.keyId;

  return new Promise<RazorpayCheckoutResult>((resolve, reject) => {
    // 3. Open Razorpay modal
    const options = {
      key: effectiveKeyId,
      amount: serverOrder.amount, // in paise
      currency: serverOrder.currency || 'INR',
      name: 'Giriraj Power',
      description,
      image: '/smartrun.jpeg',
      order_id: serverOrder.isLive ? serverOrder.orderId : undefined, // pass order_id if live order was created
      prefill: {
        name: customerName,
        contact: customerPhone.replace(/\D/g, '').slice(-10),
        email: customerEmail || ''
      },
      notes: {
        merchant: 'Giriraj Power Store Kasba Kolkata',
        address: 'Kasba Kolkata, WB'
      },
      theme: {
        color: '#8B0000', // Giriraj brand crimson
        backdrop_color: 'rgba(15, 23, 42, 0.75)'
      },
      handler: async function (response: RazorpayPaymentResponse) {
        try {
          // Cryptographic verification on server
          const verification = await verifyRazorpayPayment(response, serverOrder.orderId);
          if (verification.verified) {
            const result: RazorpayCheckoutResult = {
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature
            };
            if (onSuccess) onSuccess(response);
            resolve(result);
          } else {
            const err = new Error(verification.message || 'Payment signature verification failed.');
            if (onFailure) onFailure(err);
            reject(err);
          }
        } catch (verErr) {
          if (onFailure) onFailure(verErr);
          reject(verErr);
        }
      },
      modal: {
        ondismiss: function () {
          if (onDismiss) onDismiss();
          reject(new Error('Payment window was closed.'));
        },
        confirm_close: true,
        animation: true
      }
    };

    const rzp = new (window as any).Razorpay(options);

    rzp.on('payment.failed', function (resp: any) {
      console.error('Razorpay payment failed:', resp.error);
      const err = new Error(resp.error?.description || 'Razorpay payment failed.');
      if (onFailure) onFailure(err);
      reject(err);
    });

    rzp.open();
  });
}
