const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

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
    `The dashboard is receiving HTML instead of JSON from ${url}. Set VITE_API_BASE_URL in Vercel to your Railway backend URL, for example https://your-backend.up.railway.app.`
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
    credentialsMode = 'include',
    headers = {},
    method = 'GET',
    query,
    suppressUnauthorizedEvent = false
  } = {}
) {
  const url = buildUrl(path, query);
  const response = await fetch(url, {
    method,
    credentials: credentialsMode,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
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
