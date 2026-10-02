import { useSyncExternalStore } from 'react';

let source: string | null = null;
const listeners = new Set<() => void>();

export function morphKey(scope: string, id: number) {
  return `${scope}:${id}`;
}

export function setMorphSource(key: string) {
  if (key === source) return;
  source = key;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useIsMorphSource(key: string) {
  return useSyncExternalStore(
    subscribe,
    () => source === key,
    () => false,
  );
}
