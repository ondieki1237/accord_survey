// Device fingerprinting using FingerprintJS Pro API
// https://github.com/fingerprintjs/fingerprintjs
// This generates a unique identifier for a device to prevent multiple votes

export const getDeviceFingerprint = async (): Promise<string> => {
  try {
    // Try to dynamically import the FingerprintJS package (if installed)
    try {
      // @ts-ignore - dynamic import
      const mod = await import('@fingerprintjs/fingerprintjs');
      const FingerprintJS = mod?.default || mod;
      if (FingerprintJS && typeof FingerprintJS.load === 'function') {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        return result?.visitorId || generateFallbackDeviceId();
      }
    } catch (err) {
      // ignore - fallback to CDN loader below
    }

    // Load FingerprintJS from CDN as a fallback
    const FingerprintJS = await loadFingerprintJS();
    if (!FingerprintJS) throw new Error('FingerprintJS failed to load');
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    return result?.visitorId || generateFallbackDeviceId();
  } catch (error) {
    console.error('[Accord] Error generating device fingerprint:', error);
    // Fallback: generate a device ID from browser info
    return generateFallbackDeviceId();
  }
};

// Load FingerprintJS library from CDN
const loadFingerprintJS = async (): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if ((window as any).FingerprintJS) {
      resolve((window as any).FingerprintJS);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fingerprint.umd.min.js';
    script.async = true;
    
    script.onload = () => {
      // FingerprintJS is now available as a global
      resolve((window as any).FingerprintJS);
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load FingerprintJS from CDN'));
    };

    document.head.appendChild(script);
  });
};

// Fallback device ID generation if FingerprintJS fails
const generateFallbackDeviceId = (): string => {
  // Combine multiple browser/device properties
  const navigator_data = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset(),
    screen.width,
    screen.height,
    screen.colorDepth,
    navigator.hardwareConcurrency || '',
    navigator.deviceMemory || '',
  ].join('|');

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < navigator_data.length; i++) {
    const char = navigator_data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return 'fallback_' + Math.abs(hash).toString(16);
};

// Check if device has already voted in a review cycle
export const checkIfDeviceVoted = async (
  reviewCycleId: string,
  apiBaseUrl: string
): Promise<boolean> => {
  try {
    const deviceId = await getDeviceFingerprint();
    const res = await fetch(
      `${apiBaseUrl}/votes/check/${reviewCycleId}/${encodeURIComponent(deviceId)}`
    );
    const data = await res.json();
    return data.success ? data.hasVoted : false;
  } catch (error) {
    console.error('[Accord] Error checking vote status:', error);
    return false;
  }
};

// Submit vote with device fingerprint
export const submitVote = async (
  payload: {
    deviceId: string;
    reviewCycleId: string;
    targetEmployeeId: string;
    score: number;
    comment?: string;
  },
  apiBaseUrl: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    const res = await fetch(`${apiBaseUrl}/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('[Accord] Error submitting vote:', error);
    return { success: false, message: 'Failed to submit vote' };
  }
};
