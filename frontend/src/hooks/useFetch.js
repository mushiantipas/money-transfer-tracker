import { useState, useEffect, useRef } from 'react';

const useFetch = (fetchFn, params = null) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const paramsRef = useRef(params);

  const execute = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = paramsRef.current
        ? await fetchFn(paramsRef.current)
        : await fetchFn();
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    paramsRef.current = params;
  });

  useEffect(() => {
    execute();
  }, [fetchFn]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch: execute };
};

export default useFetch;
