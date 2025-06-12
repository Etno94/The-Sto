import Asserts from "../utils/asserts.js";

export default class GameLoop {

    /** @type {Function[]} */
    #functions = [];

    /** @type {number} */
    #lastUpdate = 0;
    /** @type {number} */
    #accumulator = 0;
    /** @type {number} */
    #updateInterval = 1000;

    /** @param {number} updateInterval */
    constructor(updateInterval = 1000) {
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
            this.#functions.forEach(func => func());
            this.#accumulator -= this.#updateInterval;
        }

        requestAnimationFrame(this.loop);
    }

}