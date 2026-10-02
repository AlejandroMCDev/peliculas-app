import { useSyncExternalStore } from 'react';

/*
 * The card → detail morph pairs two <ViewTransition>s with the same name (`poster-<id>`), and a
 * name must be unique on the page. The home can show one movie in several sections, so only the
 * card the user clicked carries the name. This tiny store remembers which one it was
 * ("<scope>:<id>", e.g. "action:550"), so the morph also plays back to that same card.
 */

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

/** True only for the card that was clicked last: each card re-renders only when this flips. */
export function useIsMorphSource(key: string) {
  return useSyncExternalStore(
    subscribe,
    () => source === key,
    () => false,
  );
}
