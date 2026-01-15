export function getBaseUrl(): string {
  // Check if we're in browser
  if (typeof window !== 'undefined') {
    /*if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return process.env.DOMAIN_URL;
    }*/
    return `${window.location.protocol}//${window.location.host}`;
  }

  return process.env.NODE_ENV === 'production' 
    ? `${window.location.protocol}//${window.location.host}`
    : 'http://localhost:5000';
}

export function getApiUrl(endpoint: string): string {
  const baseUrl = getBaseUrl();
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}/api${cleanEndpoint}`;
}

export function getDisplayUrl(): string {
  const baseUrl = getBaseUrl();
  return baseUrl.replace(/^https?:\/\//, '');
}