import { useState, useEffect, useCallback } from 'react';

const useFetch = (fetchFn, params = null, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = params ? await fetchFn(params) : await fetchFn();
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [fetchFn, JSON.stringify(params)]);  // eslint-disable-line

  useEffect(() => {
    fetch();
  }, [fetch, ...deps]);  // eslint-disable-line

  return { data, loading, error, refetch: fetch };
};

export default useFetch;
