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

    widthIn(element) {
        element.offsetWidth;
        requestAnimationFrame(() => {
            element.classList.remove('no-width');
        });
    }

    widthOut(element) {
        element.classList.add('no-width');
    }
}