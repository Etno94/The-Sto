export class Save {
    constructor() {
    }

    loadSave(jsonSave) {
        return JSON.parse(jsonSave);
    }
    
    saveGame(save) {
        localStorage.setItem('save', JSON.stringify(save));
    }
    
    resetGame() {
        localStorage.removeItem('save');
        location.reload();
    }
}