import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

export interface ApiState<T> { data: T | null; loading: boolean; error: string; reload: () => Promise<void> }

/**
 * Loads data when the screen is focused (so lists are fresh after you come back from an edit screen)
 * and again whenever `deps` change. Keeps showing old data while refreshing.
 */
export function useApi<T>(fn: () => Promise<T>, deps: unknown[] = []): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const seq = useRef(0);

  const load = useCallback(async () => {
    const id = ++seq.current;
    try {
      const r = await fnRef.current();
      if (id === seq.current) { setData(r); setError(''); }
    } catch (e: any) {
      if (id === seq.current) setError(e?.message ?? 'Something went wrong');
    } finally {
      if (id === seq.current) setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useFocusEffect(useCallback(() => { load(); }, [load, ...deps]));
  return { data, loading, error, reload: load };
}
