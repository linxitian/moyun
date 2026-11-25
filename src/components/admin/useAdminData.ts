'use client';

import { useEffect, useState } from 'react';

export function useAdminData<T>(url: string, key: string, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(url, { signal: controller.signal });
        const payload = await response.json();
        if (!response.ok || !Object.hasOwn(payload, key)) throw new Error(payload.error || '加载失败，请重试');
        if (!controller.signal.aborted) {
          setData(payload[key]);
          setError(null);
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted) setError(error instanceof Error ? error.message : '加载失败，请重试');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [url, key, revision]);

  function reload() {
    setLoading(true);
    setRevision((value) => value + 1);
  }

  return { data, setData, loading, error, reload };
}
