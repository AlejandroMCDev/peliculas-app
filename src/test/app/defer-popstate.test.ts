import { afterEach, describe, expect, it, vi } from 'vitest';
import { deferPopstate } from '@/app/defer-popstate';

afterEach(() => {
  vi.useRealTimers();
});

describe('deferPopstate', () => {
  it('calls popstate listeners after the event, not during it', () => {
    vi.useFakeTimers();
    const proxied = deferPopstate(window);
    const listener = vi.fn();
    proxied.addEventListener('popstate', listener);

    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(listener).not.toHaveBeenCalled();

    vi.runAllTimers();
    expect(listener).toHaveBeenCalledOnce();
    proxied.removeEventListener('popstate', listener);
  });

  it('stops calling a listener once it is removed', () => {
    vi.useFakeTimers();
    const proxied = deferPopstate(window);
    const listener = vi.fn();
    proxied.addEventListener('popstate', listener);
    proxied.removeEventListener('popstate', listener);

    window.dispatchEvent(new PopStateEvent('popstate'));
    vi.runAllTimers();

    expect(listener).not.toHaveBeenCalled();
  });

  it('leaves other events and window properties untouched', () => {
    const proxied = deferPopstate(window);
    const listener = vi.fn();
    proxied.addEventListener('resize', listener);

    window.dispatchEvent(new Event('resize'));

    expect(listener).toHaveBeenCalledOnce();
    expect(proxied.location.pathname).toBe(window.location.pathname);
    proxied.removeEventListener('resize', listener);
  });
});
