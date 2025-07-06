import {FRESH_SAVE, TEST_SAVES} from '../data/save.data.js';
import SaveProxy from './proxy.js';
import {EventBus} from './event-bus.js';

 function createGlobal() {

    /**
     * Mode 1 = development
     * Mode 2 = testing
     * Mode 3 = production
     */
    const mode = 1;
    const freshSave = FRESH_SAVE;
    const testSave = TEST_SAVES[0];
    const saves = {
        1: freshSave,
        2: testSave,
        3: freshSave
    }
    const saveProxy = new SaveProxy(saves[mode]);
    const proxy = saveProxy.proxy;
    const eventBus = EventBus;

    if (mode === 3)
        document.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        });

    return {
        mode,
        freshSave,
        testSave,
        saveProxy,
        proxy,
        eventBus
    };
}

const Global = createGlobal();
export default Global