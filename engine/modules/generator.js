export class Generator {

    generator = null;

    constructor (generator) {
        this.generator = generator;
    }

    generates() {
        return this.generator.generates;
    }

    consumes() {
        return this.generator.consumes;
    }

    isHinted(points) {
        let hinted = true;
        for (const [key, value] of Object.entries(points)) {
            if (this.generator.unlockRequires.hint[key] > value)
                hinted = false;
        }
        return hinted;
    }

    canBuild(points) {
        let canBuild = true;
        for (const [key, value] of Object.entries(points)) {
            if (this.generator.unlockRequires.build[key] > value)
                canBuild = false;
        }
        return canBuild;
    }

    build () {
        
    }
}