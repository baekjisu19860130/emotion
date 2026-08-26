// AI Studio Shared Preview URL (public access, no Google login required)
export const SHARED_PUBLIC_APP_URL = 'https://ais-pre-nnbjm3lpk7q55hqdx6k3ux-331325598994.asia-northeast1.run.app';

/**
 * Helper to get the public participant URL that does NOT require Google AI Studio developer login.
 * In AI Studio, 'ais-dev-' URLs require account login, while 'ais-pre-' URLs are publicly accessible.
 */
export function getPublicShareUrl(): string {
  if (typeof window === 'undefined') return SHARED_PUBLIC_APP_URL;
  
  try {
    let url = window.location.origin;

    if (url && url.includes('ais-dev-')) {
      return url.replace('ais-dev-', 'ais-pre-');
    }

    if (url && url.includes('ais-pre-')) {
      return url;
    }
  } catch (e) {
    // ignore
  }

  return SHARED_PUBLIC_APP_URL;
}

