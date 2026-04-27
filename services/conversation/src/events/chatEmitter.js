/**
 * Async event emitter — Subject in the Observer pattern.
 * Exported as a singleton; all modules share the same instance.
 */
class AsyncEventEmitter {
  constructor() {
    this._listeners = {};
  }

  on(event, fn) {
    (this._listeners[event] ??= []).push(fn);
  }

  async emit(event, payload) {
    await Promise.all((this._listeners[event] ?? []).map(fn => fn(payload)));
  }
}

module.exports = new AsyncEventEmitter();
