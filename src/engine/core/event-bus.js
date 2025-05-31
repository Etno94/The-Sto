class MainEventBus {

  constructor() {
    /**
     * @type {Object<string, Function[]>}
     */
    this.events = {};
  }

  /**
   * @param {string} event 
   * @param {Function} listener 
   */
  on(event, listener) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);
  }

  /**
   * @param {string} event 
   * @param {Function} listener 
   */
  off(event, listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }

  /**
   * @param {string} event 
   * @param {...any} args
   */
  emit(event, ...args) {
    if (!this.events[event]) return;
    for (const listener of this.events[event]) {
      listener(...args);
    }
  }

  /**
   * @param {string} event 
   * @param {Function} listener 
   */
  once(event, listener) {
    const wrapper = (...args) => {
      listener(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
}

const EventBus = new MainEventBus();
export default EventBus;