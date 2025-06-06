import DataManager from "../systems/data.manager.js";

import Asserts from "../utils/asserts.js";

class MainEventBus {
  /**
   * @type {Object<string, Function[]>}
   */
  #events = {};

  constructor() {}

  /**
   * @param {string} event
   * @param {Function} listener
   */
  on(event, listener) {
    Asserts.string(event);
    Asserts.function(listener);

    (this.#events[event] ||= []).push(listener);
  }

  /**
   * @param {string} event
   * @param {Function} listener
   */
  off(event, listener) {
    Asserts.string(event);
    Asserts.function(listener);

    if (!this.#events[event]) return;
    this.#events[event] = this.#events[event].filter((l) => l !== listener);
  }

  /**
   * @param {string} event
   * @param {...any} args
   */
  emit(event, ...args) {
    Asserts.string(event);
    Asserts.notNullOrUndefined(this.#events[event]);

    for (const listener of this.#events[event]) {
      listener(...args);
    }
  }

  /**
   * @param {string} event
   * @param {Function} listener
   */
  once(event, listener) {
    Asserts.string(event);
    Asserts.function(listener);

    const wrapper = (...args) => {
      listener(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
}

export const EventBus = new MainEventBus();
export const Events = DataManager.getBusEventsData();
