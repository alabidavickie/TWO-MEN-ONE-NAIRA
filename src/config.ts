// Display price shown in the UI before redirecting to Bachs.
//
// IMPORTANT: the amount actually charged is whatever the Bachs *product* is
// priced at (that is the source of truth). Keep this in sync with the product
// price you set in the Bachs dashboard so the UI doesn't mislead buyers.
export const PRICE_PER_COPY = 15; // e.g. 15.00
export const PRICE_CURRENCY = "USD";
export const MAX_COPIES = 10;

// Base URL for the /api functions. Empty = same origin (the deployed Netlify
// site serves both the app and its functions). For local dev against a deployed
// backend, set VITE_API_BASE to your Netlify site URL, e.g.
// "https://your-site.netlify.app".
export const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export function formatMoney(amount: number, currency: string = PRICE_CURRENCY): string {
  return `${currency} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
