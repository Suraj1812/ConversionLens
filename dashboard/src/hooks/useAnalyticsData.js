import { useEffect, useState } from 'react';
import { getJson } from '../api.js';

export function useAnalyticsData(path, query) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const nextData = await getJson(path, query);

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
  }, [path, JSON.stringify(query)]);

  return {
    data,
    loading,
    error
  };
}
