import Global from "./global.js";

import Asserts from "../utils/asserts.js";
export default class GameLoop {

    /** @type {Function[]} */
    #functions = [];

    /** @type {number} */
    #lastUpdate = 0;
    /** @type {number} */
    #accumulator = 0;
    /** @type {number} */
    #updateInterval;

    /** @param {number} updateInterval */
    constructor(updateInterval = 16) {
        this.#updateInterval = updateInterval;
        this.loop = this.#gameLoop.bind(this);
        return this;
    }

    /**
     * @param {Function[]} functions 
     */
    setGameUpdates(functions) {
        Asserts.functionArray(functions, 'functions');
        this.#functions = [...functions];
        return this;
    }

    start() {
        this.#lastUpdate = performance.now();
        requestAnimationFrame(this.loop);
    }

    #gameLoop(timestamp) {
        const delta = timestamp - this.#lastUpdate;
        this.#lastUpdate = timestamp;
        this.#accumulator += delta;

        while (this.#accumulator >= this.#updateInterval) {
            this.#functions.forEach(func => func(this.#updateInterval));
            this.#accumulator -= this.#updateInterval;
        }

        Global.proxy.time.accumulator = this.#accumulator;
        Global.proxy.time.saveTimestamp = Date.now();

        requestAnimationFrame(this.loop);
    }

}