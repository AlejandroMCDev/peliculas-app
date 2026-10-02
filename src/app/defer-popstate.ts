/**
 * React renders updates that start inside a `popstate` event (browser Back/Forward, `navigate(-1)`)
 * synchronously, and those renders skip `<ViewTransition>`. This hands `popstate` to the router one
 * task later, outside the event, so Back is an ordinary transition and the poster morph plays both ways.
 *
 * It returns a window for `createBrowserRouter({ window })`: identical to the real one except that
 * the router's `popstate` listeners are called with a short delay.
 */
export function deferPopstate(win: Window): Window {
  const wrapped = new WeakMap<EventListenerOrEventListenerObject, EventListener>();

  const defer = (listener: EventListenerOrEventListenerObject): EventListener => {
    let deferred = wrapped.get(listener);
    if (!deferred) {
      deferred = (event) =>
        void setTimeout(() =>
          typeof listener === 'function' ? listener(event) : listener.handleEvent(event),
        );
      wrapped.set(listener, deferred);
    }
    return deferred;
  };

  const addEventListener: Window['addEventListener'] = (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) => win.addEventListener(type, type === 'popstate' ? defer(listener) : listener, options);

  const removeEventListener: Window['removeEventListener'] = (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ) =>
    win.removeEventListener(
      type,
      type === 'popstate' ? (wrapped.get(listener) ?? listener) : listener,
      options,
    );

  return new Proxy(win, {
    get(target, property) {
      if (property === 'addEventListener') return addEventListener;
      if (property === 'removeEventListener') return removeEventListener;
      const value: unknown = Reflect.get(target, property, target);
      // Window methods (setTimeout, scrollTo…) throw "Illegal invocation" unless called on the real window.
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
}
