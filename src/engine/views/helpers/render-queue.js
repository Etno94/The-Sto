import { EventBus, Events } from "../../core/event-bus.js";

class RenderQueue {

    constructor() {
        this.renderQueue = [];
        this.isProcessingQueue = false;
    }

    async processRenderQueue() {
        if (this.isProcessingQueue) return;
        this.isProcessingQueue = true;
        EventBus.emit(Events.ui.render, true);

        while (this.renderQueue.length) {
            const job = this.renderQueue.shift();
            await job();
        }
        this.isProcessingQueue = false;
        EventBus.emit(Events.ui.render, false);
    }

    /** 
     * @param {Function} job
     * @param {...any} args
     * */
    queue(job, ...args) {
        this.renderQueue.push(() => job(...args));
        this.processRenderQueue();
    }
}
export const RenderQ = new RenderQueue();