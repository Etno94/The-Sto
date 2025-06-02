import {FRESH_SAVE, TEST_SAVES} from '../data/save.data.js';
import SaveProxy from './proxy.js';
import EventBus from './event-bus.js';

 function createGlobal() {

    const mode = 1;
    const freshSave = FRESH_SAVE;
    const testSave = TEST_SAVES[0];
    const saveProxy = new SaveProxy(mode === 1 ? freshSave : testSave);
    const proxy = saveProxy.proxy;
    const eventBus = EventBus;

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