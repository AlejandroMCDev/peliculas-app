import { useEffect, useState } from 'react';

/**
 * Tells whether an element is (nearly) visible. Attach the returned callback as a `ref`.
 * Used for infinite scroll: a sentinel at the end of the list triggers the next page.
 */
export function useInView<T extends Element>(rootMargin = '400px') {
  const [node, setNode] = useState<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false),
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, rootMargin]);

  return [setNode, inView] as const;
}
