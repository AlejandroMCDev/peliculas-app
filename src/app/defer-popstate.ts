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
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
}
