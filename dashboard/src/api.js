const SESSION_TOKEN_KEY = 'shoplytics.session_token';
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.location.hostname.endsWith('vercel.app')
    ? 'https://conversionlens-production.up.railway.app'
    : '/api');

function buildUrl(path, query = {}) {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  return url;
}

function buildApiConfigurationError(url) {
  const error = new Error(
    `The dashboard is receiving HTML instead of JSON from ${url}. Check the Vercel /api rewrite or your VITE_API_BASE_URL configuration.`
  );
  error.statusCode = 500;
  return error;
}

function createRequestError(message, statusCode, details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  return error;
}

export async function requestJson(
  path,
  {
    body,
    credentialsMode = 'omit',
    headers = {},
    method = 'GET',
    query,
    suppressUnauthorizedEvent = false
  } = {}
) {
  const url = buildUrl(path, query);
  const sessionToken = getStoredSessionToken();
  const response = await fetch(url, {
    method,
    credentials: credentialsMode,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
      ...headers
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('text/html')) {
    throw buildApiConfigurationError(url);
  }

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));

    if (response.status === 401 && !suppressUnauthorizedEvent && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shoplytics:unauthorized'));
    }

    throw createRequestError(
      errorPayload.message || `Request failed with status ${response.status}`,
      response.status,
      errorPayload.details
    );
  }

  return response.json();
}

export function getJson(path, query, options = {}) {
  return requestJson(path, {
    ...options,
    query
  });
}

export function postJson(path, body, options = {}) {
  return requestJson(path, {
    ...options,
    method: 'POST',
    body
  });
}

export function getStoredSessionToken() {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.localStorage.getItem(SESSION_TOKEN_KEY) || '';
}

export function setStoredSessionToken(token) {
  if (typeof window === 'undefined') {
    return;
  }

  if (token) {
    window.localStorage.setItem(SESSION_TOKEN_KEY, token);
    return;
  }

  window.localStorage.removeItem(SESSION_TOKEN_KEY);
}

export function clearStoredSessionToken() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(SESSION_TOKEN_KEY);
}
