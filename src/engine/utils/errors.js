export default class Errors {
    static logError(error) {
        console.error(`Error: ${error.message}`);
    }

    static throwError(message) {
        throw new Error(`Error: ${message}`);
    }

    static invalidTypeError(type, expectedType) {
        throw new Error(`Invalid type: ${type}. Expected type: ${expectedType}.`);
    }
}