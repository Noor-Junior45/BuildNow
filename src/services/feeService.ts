import { API_BASE_URL } from '../lib/apiBase';
import { CartItem, FeePolicySettings, OrderFeeBreakdown, ProductChargeDetail } from '../types';

export const DEFAULT_FEE_SETTINGS: FeePolicySettings = {
  freeDeliveryThreshold: 0,
  baseDeliveryFee: 0,
  handlingFee: 0,
  rainFee: {
    enabled: false,
    amount: 0,
    label: 'Rain / Weather Surcharge'
  },
  surgeFee: {
    enabled: false,
    amount: 0,
    label: 'High Demand Surge'
  },
  customFees: [],
  productCharges: {},
  productChargeMode: 'per_item'
};

const CACHE_KEY = 'gp_fee_policy_settings_v1';
let cachedSettings: FeePolicySettings | null = null;
let lastFetchTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

/**
 * Retrieves the current fee policy from the backend.
 * Falls back to localStorage, then default policy.
 */
export async function getFeeSettings(forceRefresh = false): Promise<FeePolicySettings> {
  const now = Date.now();
  if (!forceRefresh && cachedSettings && now - lastFetchTimestamp < CACHE_TTL_MS) {
    return cachedSettings;
  }

  // Check localStorage for quick warm-up
  if (!cachedSettings) {
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        cachedSettings = { ...DEFAULT_FEE_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      // Ignore JSON parse error
    }
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/fee-settings`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.settings) {
        cachedSettings = { ...DEFAULT_FEE_SETTINGS, ...data.settings };
        lastFetchTimestamp = now;
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(cachedSettings));
        } catch {
          // LocalStorage quota or disabled
        }
        return cachedSettings;
      }
    }
  } catch (err) {
    console.warn('[FeeService] Using cached or default fee settings:', err);
  }

  return cachedSettings || DEFAULT_FEE_SETTINGS;
}

/**
 * Calculates itemized charges for an array of cart items based on fee policy
 */
export function calculateOrderFees(
  items: CartItem[],
  settings: FeePolicySettings = cachedSettings || DEFAULT_FEE_SETTINGS
): OrderFeeBreakdown {
  const activeItems = items.filter((it) => it && it.product && it.quantity > 0);

  // Subtotal (selling price)
  const subtotal = activeItems.reduce((sum, it) => {
    const p = Number(it.product.price || 0);
    return sum + p * it.quantity;
  }, 0);

  const threshold = Number(settings.freeDeliveryThreshold ?? 0);
  const baseFee = Number(settings.baseDeliveryFee ?? 0);
  const isFreeDelivery = baseFee === 0 || subtotal >= threshold || activeItems.length === 0;
  const deliveryFee = isFreeDelivery ? 0 : baseFee;

  // Handling fee
  const handlingFee = activeItems.length > 0 ? Number(settings.handlingFee ?? 0) : 0;

  // Rain Fee
  const rainActive = Boolean(settings.rainFee?.enabled && activeItems.length > 0);
  const rainFee = rainActive ? Math.max(0, Number(settings.rainFee?.amount || 0)) : 0;

  // Surge Fee
  const surgeActive = Boolean(settings.surgeFee?.enabled && activeItems.length > 0);
  const surgeFee = surgeActive ? Math.max(0, Number(settings.surgeFee?.amount || 0)) : 0;

  // Per-Product Specific Charges
  const productChargesMap = settings.productCharges || {};
  const chargeMode = settings.productChargeMode || 'per_item';
  const productCharges: ProductChargeDetail[] = [];
  let totalProductCharges = 0;

  if (activeItems.length > 0) {
    for (const it of activeItems) {
      const prodId = String(it.product.id);
      // Check policy map first, then individual product property if specified
      const unitCharge =
        productChargesMap[prodId] !== undefined
          ? Number(productChargesMap[prodId])
          : Number(it.product.deliveryCharge ?? it.product.handlingCharge ?? 0);

      if (unitCharge > 0) {
        const lineTotal = chargeMode === 'per_item' ? unitCharge * it.quantity : unitCharge;
        totalProductCharges += lineTotal;
        productCharges.push({
          productId: prodId,
          name: it.product.name,
          unitCharge,
          quantity: it.quantity,
          totalCharge: lineTotal
        });
      }
    }
  }

  // Custom Fees
  const appliedCustomFees: Array<{ id: string; label: string; amount: number }> = [];
  let totalCustomFees = 0;
  if (Array.isArray(settings.customFees) && activeItems.length > 0) {
    for (const cf of settings.customFees) {
      if (cf.enabled && Number(cf.amount) > 0) {
        appliedCustomFees.push({
          id: cf.id,
          label: cf.label,
          amount: Number(cf.amount)
        });
        totalCustomFees += Number(cf.amount);
      }
    }
  }

  const totalFees = deliveryFee + handlingFee + rainFee + surgeFee + totalProductCharges + totalCustomFees;
  const grandTotal = subtotal + totalFees;

  return {
    subtotal,
    isFreeDelivery,
    freeDeliveryThreshold: threshold,
    deliveryFee,
    baseDeliveryFee: baseFee,
    handlingFee,
    rainFee,
    rainFeeActive: rainActive,
    surgeFee,
    surgeFeeActive: surgeActive,
    productCharges,
    totalProductCharges,
    customFees: appliedCustomFees,
    totalCustomFees,
    totalFees,
    grandTotal
  };
}

/**
 * Updates fee policy in the backend (used by backend/admin callers)
 */
export async function updateFeeSettings(
  updatedSettings: Partial<FeePolicySettings>,
  apiKey?: string
): Promise<{ success: boolean; settings?: FeePolicySettings; message?: string }> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) headers['x-api-key'] = apiKey;

    const res = await fetch(`${API_BASE_URL}/api/fee-settings`, {
      method: 'POST',
      headers,
      body: JSON.stringify(updatedSettings)
    });

    const data = await res.json();
    if (res.ok && data.success) {
      cachedSettings = { ...DEFAULT_FEE_SETTINGS, ...data.settings };
      lastFetchTimestamp = Date.now();
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cachedSettings));
      } catch {
        // Safe fallback
      }
      return { success: true, settings: cachedSettings };
    }
    return { success: false, message: data.message || 'Failed to update settings' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error updating fee settings' };
  }
}
