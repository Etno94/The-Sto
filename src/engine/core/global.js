import {FRESH_SAVE, TEST_SAVES} from '../data/fresh-save.data.js';
import SaveProxy from './proxy.js';

 function createGlobal() {
    const mode = 1;
    const freshSave = FRESH_SAVE;
    const testSave = TEST_SAVES[0];
    const saveProxy = new SaveProxy(mode === 1 ? freshSave : testSave);
    const proxy = saveProxy.proxy;

    return {
        mode,
        freshSave,
        testSave,
        saveProxy,
        proxy
    };
}
const Global = createGlobal();

export default Global