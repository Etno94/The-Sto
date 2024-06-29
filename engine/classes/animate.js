import Utils from './utils.js';

export default class Animate {
    constructor(){
        this.utils = new Utils();
    }

    async timedOut(element, animation) {
        element.classList.toggle(...animation.classes);

        await this.utils.delay(animation.timer);

        element.classList.toggle(...animation.classes);
    }

    widthIn(element, classes = ['no-width']) {
        element.offsetWidth;
        requestAnimationFrame(() => {
            element.classList.remove(...classes);
        });
    }

    widthOut(element, classes = ['no-width']) {
        element.classList.add(...classes);
    }
}