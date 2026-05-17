export default class GameSave {

    /** @returns {SaveType | null} */
    static load() {
        const rawSave = localStorage.getItem('save');
        if (!rawSave) return null;

        try {
            return JSON.parse(rawSave);
        } catch (error) {
            console.error('Failed to parse saved game data:', rawSave, error);
            return null;
        }
    }
    
    static save(save) {
        localStorage.setItem('save', JSON.stringify(save));
    }
    
    static reset() {
        localStorage.removeItem('save');
        location.reload();
    }
}