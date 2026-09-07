import { KolkataArea } from '../types';
import { KOLKATA_AREAS } from '../data/kolkataAreas';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export interface ResilientPosition {
  lat: number;
  lng: number;
  accuracy?: number;
  isFallback?: boolean;
}

export interface GeolocationResult {
  success: boolean;
  coords: {
    lat: number;
    lng: number;
  };
  resolvedStreet?: string;
  matchedArea: KolkataArea;
  error?: string;
  isPermissionDenied?: boolean;
}

/**
 * Finds the closest predefined Kolkata Area to given coordinates
 */
export function findNearestKolkataArea(lat: number, lng: number, pincode?: string): KolkataArea {
  if (pincode) {
    const pinMatch = KOLKATA_AREAS.find((a) => a.pincode && a.pincode === pincode);
    if (pinMatch) return pinMatch;
  }

  let minDistance = Number.MAX_VALUE;
  let closest = KOLKATA_AREAS[0];

  for (const area of KOLKATA_AREAS) {
    if (area.lat && area.lng) {
      const dist = Math.hypot(area.lat - lat, area.lng - lng);
      if (dist < minDistance) {
        minDistance = dist;
        closest = area;
      }
    }
  }

  return closest;
}

/**
 * Safely fetches reverse geocoded street name with timeout and instant fallback
 */
export async function reverseGeocodeWithFallback(
  lat: number,
  lng: number,
  timeoutMs = 4000
): Promise<{ street: string; pincode?: string; matchedArea: KolkataArea }> {
  const matchedArea = findNearestKolkataArea(lat, lng);
  let resolvedStreet = matchedArea.exactStreet || matchedArea.name;
  let pincode: string | undefined = matchedArea.pincode;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en'
        },
        signal: controller.signal
      }
    );

    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const road = addr.road || addr.street || addr.pedestrian || addr.footway || '';
        const suburb =
          addr.suburb ||
          addr.neighbourhood ||
          addr.residential ||
          addr.quarter ||
          addr.city_district ||
          '';
        const building = addr.building || addr.amenity || addr.shop || '';
        pincode = addr.postcode || pincode;

        const parts = [building, road, suburb].filter(Boolean);
        if (parts.length > 0) {
          resolvedStreet = parts.join(', ');
        } else if (data.display_name) {
          resolvedStreet = data.display_name.split(',').slice(0, 3).join(', ');
        }
      }
    }
  } catch (err) {
    console.debug('Reverse geocoding notice (fallback area used):', err);
  }

  const finalMatched = findNearestKolkataArea(lat, lng, pincode);

  return {
    street: resolvedStreet,
    pincode,
    matchedArea: finalMatched
  };
}

/**
 * Safely wraps browser navigator.geolocation.getCurrentPosition with a hard timeout
 */
function tryWebPosition(options: PositionOptions, hardTimeoutMs: number): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error(`Location request timed out after ${Math.round(hardTimeoutMs / 1000)}s`));
      }
    }, hardTimeoutMs);

    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            resolve(pos);
          }
        },
        (err) => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            reject(err);
          }
        },
        options
      );
    } catch (callErr) {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        reject(callErr);
      }
    }
  });
}

/**
 * Multi-Tier Resilient Geolocation Resolver:
 * - On Native Android (APK): Uses @capacitor/geolocation with automatic runtime permission requests
 * - On Web: Uses robust multi-tier HTML5 geolocation with hard timeouts & network fallback
 */
export async function getResilientCurrentPosition(): Promise<ResilientPosition> {
  // 1. Native Capacitor App (Android APK / iOS)
  if (Capacitor.isNativePlatform()) {
    try {
      // Check & request runtime permissions on Android
      let perm = await Geolocation.checkPermissions();
      if (perm.location !== 'granted') {
        perm = await Geolocation.requestPermissions();
      }

      if (perm.location === 'denied') {
        const error = new Error('Location permission was denied. Please allow location access in your Android app settings.');
        (error as any).code = 1;
        throw error;
      }
    } catch (permErr: any) {
      if (permErr?.code === 1 || String(permErr?.message || '').toLowerCase().includes('denied')) {
        throw permErr;
      }
      console.warn('Native permission check notice:', permErr);
    }

    // Try High Accuracy Native GPS
    try {
      const pos = await Promise.race([
        Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('GPS location timed out')), 12000)
        )
      ]);

      return {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy
      };
    } catch (gpsErr) {
      console.warn('Native high accuracy GPS failed or timed out, trying coarse/network...', gpsErr);
      // Fallback to coarse/network native location
      try {
        const pos = await Promise.race([
          Geolocation.getCurrentPosition({
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Network location timed out')), 12000)
          )
        ]);

        return {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        };
      } catch (networkErr: any) {
        console.warn('Native network location failed:', networkErr);
        throw networkErr;
      }
    }
  }

  // 2. Web Browser
  if (typeof window === 'undefined' || !navigator.geolocation) {
    throw new Error('Geolocation is not supported by this browser.');
  }

  let lastError: any = null;

  // Web Attempt 1: High Accuracy GPS (8s timeout)
  try {
    const pos = await tryWebPosition(
      {
        enableHighAccuracy: true,
        timeout: 7000,
        maximumAge: 60000
      },
      8000
    );
    return {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy
    };
  } catch (err: any) {
    lastError = err;
    if (err && err.code === 1) {
      const error = new Error('Location permission was denied. Please allow location access in your browser address bar.');
      (error as any).code = 1;
      throw error;
    }
  }

  // Web Attempt 2: Coarse Network / Cellular / WiFi (works indoors & desktops)
  try {
    const pos = await tryWebPosition(
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 300000
      },
      9000
    );
    return {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy
    };
  } catch (err: any) {
    lastError = err;
    if (err && err.code === 1) {
      const error = new Error('Location permission was denied. Please allow location access in your browser address bar.');
      (error as any).code = 1;
      throw error;
    }
  }

  // If all attempts failed, provide clear message
  const finalError = new Error(
    lastError?.message ||
      'Unable to retrieve current location. Please verify your device GPS is on or choose your area manually.'
  );
  (finalError as any).code = lastError?.code;
  throw finalError;
}
