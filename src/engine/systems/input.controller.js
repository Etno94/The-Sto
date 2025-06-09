import Global from "../core/global.js";
import GameSave from "../core/save.js";
import { EventBus, Events } from "../core/event-bus.js";

class InputController {
    
    // Settings
    saveButton = document.getElementById("saveGame");
    resetButton = document.getElementById("resetGame");

    dump = document.getElementById("dump");

    constructor() {
        this.saveButton.addEventListener("click", () => GameSave.save(Global.proxy));
        this.resetButton.addEventListener("click", () => GameSave.reset());
        this.dump.addEventListener("click", () => EventBus.emit(Events.points.burnAll));
    }
}
export default new InputController();