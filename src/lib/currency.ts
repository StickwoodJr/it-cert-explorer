/**
 * Bank of Canada Valet API Currency Conversion Service
 * Endpoint: https://www.bankofcanada.ca/valet/observations/FXUSDCAD/json?recent=1
 */

interface BoCObservation {
  d: string;
  FXUSDCAD: {
    v: string;
  };
}

interface BoCResponse {
  observations: BoCObservation[];
}

interface CachedRate {
  rate: number;
  fetchedAt: number;
  source: 'bank_of_canada' | 'fallback';
}

let cachedRate: CachedRate | null = null;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const FALLBACK_USD_CAD_RATE = 1.36;

export async function getUsdToCadRate(): Promise<{ rate: number; isFallback: boolean; fetchedAt: Date }> {
  const now = Date.now();

  if (cachedRate && now - cachedRate.fetchedAt < CACHE_TTL_MS) {
    return {
      rate: cachedRate.rate,
      isFallback: cachedRate.source === 'fallback',
      fetchedAt: new Date(cachedRate.fetchedAt),
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('https://www.bankofcanada.ca/valet/observations/FXUSDCAD/json?recent=1', {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Bank of Canada API returned status ${res.status}`);
    }

    const data = (await res.json()) as BoCResponse;
    const latestObs = data.observations?.[0];
    const rateStr = latestObs?.FXUSDCAD?.v;

    if (rateStr && !isNaN(parseFloat(rateStr))) {
      const parsedRate = parseFloat(rateStr);
      cachedRate = {
        rate: parsedRate,
        fetchedAt: now,
        source: 'bank_of_canada',
      };
      return {
        rate: parsedRate,
        isFallback: false,
        fetchedAt: new Date(now),
      };
    }
    throw new Error('Invalid rate payload from Bank of Canada');
  } catch (err) {
    console.warn('[CurrencyService] Bank of Canada API unavailable, using fallback rate:', err);
    // Use last cached rate if available, else static fallback
    const fallbackRate = cachedRate?.rate ?? FALLBACK_USD_CAD_RATE;
    cachedRate = {
      rate: fallbackRate,
      fetchedAt: now,
      source: 'fallback',
    };
    return {
      rate: fallbackRate,
      isFallback: true,
      fetchedAt: new Date(now),
    };
  }
}

export async function getCadExchangeRate(): Promise<number> {
  const { rate } = await getUsdToCadRate();
  return rate;
}

export function convertUsdToCad(usdAmount: number, rate: number): number {
  return Math.round(usdAmount * rate * 100) / 100;
}

export function formatCurrency(amount: number, currency: 'USD' | 'CAD' = 'USD'): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
