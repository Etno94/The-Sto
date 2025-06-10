export default class GameSave {

    /** @returns {SaveType | null} */
    static load() {
        return JSON.parse(localStorage.getItem("save")) || null;
    }
    
    static save(save) {
        localStorage.setItem('save', JSON.stringify(save));
    }
    
    static reset() {
        localStorage.removeItem('save');
        location.reload();
    }
}