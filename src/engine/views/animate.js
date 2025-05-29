import Utils from '../utils/utils.js';

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
        if (!element.classList.contains('no-width')) return;
        element.offsetWidth; // We force a layout calculation to ensure the class is applied before the next frame
        requestAnimationFrame(() => {
            element.classList.remove('no-width');
        });
    }

    widthOut(element) {
        if (element.classList.contains('no-width')) return;
        element.classList.add('no-width');
    }
}