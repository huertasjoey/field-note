import { useEffect, useState } from "react";

/**
 * Runs `fetcher(signal)` whenever the `fetcher` function changes.
 * Wrap the fetcher in useCallback so it only changes when its inputs do.
 * Returns { data, error, loading }. In-flight requests are aborted on change/unmount.
 */
export function useAsync(fetcher) {
  const [result, setResult] = useState({ fetcher: null, data: null, error: null });

  useEffect(() => {
    const controller = new AbortController();
    fetcher(controller.signal)
      .then((data) => setResult({ fetcher, data, error: null }))
      .catch((error) => {
        if (error.name !== "AbortError") setResult({ fetcher, data: null, error });
      });
    return () => controller.abort();
  }, [fetcher]);

  const loading = result.fetcher !== fetcher;
  return { data: loading ? null : result.data, error: loading ? null : result.error, loading };
}
