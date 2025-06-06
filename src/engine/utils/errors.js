export default class Errors {
    static logError(error) {
        console.error(`Error: ${error.message}`);
    }

    static throwError(message) {
        throw new Error(`Error: ${message}`);
    }

    static invalidTypeError(type, expectedType) {
        Errors.throwError(`Invalid type: ${type}. Expected type: ${expectedType}.`)
    }

    static invalidFormatError(string, format, message = '') {
        Errors.throwError(`Invalid string: ${string}. Expected format: ${format}. ${message}`)
    }

    static invalidObjectPropError(expectedProp) {
        Errors.throwError(`Invalid obj - missing prop: ${expectedProp}.`)
    }
}