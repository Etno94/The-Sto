export default class Save {

    localSave = null;

    constructor() {
        this.localSave = localStorage.getItem("save");
    }

    /**
     * @returns {boolean | null}
     */
    loadSave() {
        if (this.localSave) {
            return JSON.parse(this.localSave);
        }
        return null;
    }
    
    saveGame(save) {
        localStorage.setItem('save', JSON.stringify(save));
    }
    
    resetGame() {
        localStorage.removeItem('save');
        location.reload();
    }
}