class ErrorCodes {
    static get InvalidTypeCode() {return 'INVALID_TYPE'};
    static get NumberOutOfRangeCode() {return 'NUMBER_OUT_OF_RANGE'}
    static get MissingRequiredField() {return 'NUMBER_OUT_OF_RANGE'}
}


class InvalidType extends TypeError {
    constructor(...args) {
        super(...args);
        Error.captureStackTrace(this, InvalidType);
        this.code = ErrorCodes.InvalidTypeCode;
    }
}

class NumberOutOfRange extends Error {
    constructor(...args) {
        super(...args);
        Error.captureStackTrace(this, InvalidType);
        this.code = ErrorCodes.NumberOutOfRangeCode;
    }
}

class MissingAtLeastOneField extends Error {
    constructor(...args) {
        super(...args);
        Error.captureStackTrace(this, InvalidType);
        this.code = ErrorCodes.MissingRequiredField;
    }
}

module.exports = {
    Errors: {
        InvalidType,
        NumberOutOfRange,
        MissingAtLeastOneField
    },
    ErrorCodes: ErrorCodes
};
