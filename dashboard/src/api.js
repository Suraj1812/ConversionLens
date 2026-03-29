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
  return new Error(
    `The dashboard is receiving HTML instead of JSON from ${url}. Set VITE_API_BASE_URL in Vercel to your Railway backend URL, for example https://your-backend.up.railway.app.`
  );
}

export async function getJson(path, query) {
  const url = buildUrl(path, query);
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json'
    }
  });
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('text/html')) {
    throw buildApiConfigurationError(url);
  }

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}
