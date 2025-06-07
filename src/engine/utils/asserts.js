import Validators from './validators.js';
import Errors from './errors.js';

export default class Asserts {
    static array(value, variableName = 'value') {
        if (!Validators.isArray(value)) {
            Errors.invalidTypeError(typeof value, `Array (${variableName})`);
        }
    }

    static stringArray(value, arrName = 'arr') {
        if (!Validators.isStringArray(value)) {
            Errors.invalidArrayContent('string', arrName);
        }
    }

    static nonEmptyArray(value, variableName = 'value') {
        if (!Validators.isNonEmptyArray(value)) {
            Errors.invalidTypeError(typeof value, `Non-empty Array (${variableName})`);
        }
    }

    static string(value, variableName = 'value') {
        if (!Validators.isString(value)) {
            Errors.invalidTypeError(typeof value, `String (${variableName})`);
        }
    }

    static regex(value, regex) {
        Asserts.string(value);
        if (!Validators.matchesRegex(value, regex)) {
            Errors.invalidFormatError(value, regex);
        }
    }

    static number(value, variableName = 'value') {
        if (!Validators.isNumber(value)) {
            Errors.invalidTypeError(typeof value, `Number (${variableName})`);
        }
    }

    static object(value, variableName = 'value') {
        if (!Validators.isObject(value)) {
            Errors.invalidTypeError(typeof value, `Object (${variableName})`);
        }
    }

    static function(value, variableName = 'value') {
        if (!Validators.isFunction(value)) {
            Errors.invalidTypeError(typeof value, `Function (${variableName})`);
        }
    }

    static htmlElement(value, variableName = 'element') {
        if (!Validators.isHTMLElement(value)) {
            Errors.invalidTypeError(value?.constructor?.name || typeof value, `HTMLElement (${variableName})`);
        }
    }

    static notNullOrUndefined(value, variableName = 'value') {
        if (!Validators.isNotNullNorUndefined(value)) {
            Errors.throwError(`"${variableName}" must not be null or undefined.`);
        }
    }
}
