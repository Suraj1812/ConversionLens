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

export async function getJson(path, query) {
  const response = await fetch(buildUrl(path, query), {
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}
