import { useEffect, useState } from 'react';
import { getJson } from '../api.js';

export function useAnalyticsData(path, query, requestOptions = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const nextData = await getJson(path, query, requestOptions);

        if (isActive) {
          setData(nextData);
        }
      } catch (requestError) {
        if (isActive) {
          setError(requestError.message);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isActive = false;
    };
  }, [path, JSON.stringify(query), JSON.stringify(requestOptions)]);

  return {
    data,
    loading,
    error
  };
}
