export default class Errors {

    /** 
     * @param {Error | string} error 
     * @param {...any} args
    */
    static logError(error, ...args) {
        console.error(`Error: ${error.message || error}`);
        args.forEach(arg => console.error(arg));
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

    static invalidObjectPropValueError(objName, propValue) {
        Errors.throwError(`Invalid obj: ${objName} - prop value can not be: ${propValue}.`)
    }

    static invalidArrayContent(expectedContent, arr = '') {
        Errors.throwError(`Invalid array content: ${arr} - expected type: ${expectedContent}.`)
    }
}