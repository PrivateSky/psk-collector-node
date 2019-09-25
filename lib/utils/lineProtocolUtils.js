const {Errors} = require('../Errors');

function toLineProtocol({measurement, timestamp, tagSet = {}, fieldSet = {}}) {
    if (typeof measurement !== 'string') {
        throw new Errors.InvalidType('Measurement should be string but found ' + typeof measurement);
    }

    if (!Number.isInteger(timestamp)) {
        throw new Errors.InvalidType('Found invalid value for timestamp ' + timestamp);
    }

    const tagSetTransformed = objectToTagsForLineProtocol(tagSet);
    const fieldSetTransformed = objectToFieldsForLineProtocol(fieldSet);

    if (fieldSetTransformed === '') {
        throw new Errors.MissingAtLeastOneField('At least one field is required by line protocol');
    }

    let separator = ',';

    if (tagSetTransformed === '') { // if no tag is present, skip "," separator
        separator = '' // space is already present before fieldSetTransformed below, so it will be skipped
    }

    return `${measurement}${separator}${tagSetTransformed} ${fieldSetTransformed} ${timestamp}`;
}

/**
 * Transforms an object in a comma separated construct like "tagKey=tagValue,tagKey2=tagValue2"
 * @param {Object.<string, string>} tagSet
 * @return {string}
 * @throws Errors.InvalidType - if one of tagSet values is not a string
 */
function objectToTagsForLineProtocol(tagSet) {
    let result = '';

    if (typeof tagSet !== 'object') {
        throw new Errors.InvalidType(`Function argument expected to be object, got type ${typeof tagSet}`);
    }

    Object.keys(tagSet).forEach(tagKey => {
        const value = tagSet[tagKey];

        if (typeof value !== "string") {
            throw new Errors.InvalidType(`Received illegal type ${typeof value} for a tag value where string was expected`);
        }

        const processedValue = tagSet[tagKey].split(' ').join('\\ '); // replaces all spaces with "\ "
        result += `${tagKey}=${processedValue},`;
    });

    if (result !== '') {
        result = result.substring(0, result.length - 1) // remove trailing "," character
    }

    return result;
}

/**
 * Transforms an object in a comma separated constructs like one of the following:
 * fieldKey="fieldValue" - if fieldValue is of type string, it also converts spaces in escaped spaces (" " to "\ ")
 * fieldKey=102.12 - if fieldValue is Float, the quotation marks are not used and the value is kept as is
 * fieldKey=true - if fieldValue is boolean, the quotation marks are not used and the value is kept as is
 *
 * @param {Object<string, string|number|boolean>} fieldSet
 * @return {string}
 * @throws Errors.InvalidType - if one of fieldSet values is not a string, number or boolean
 */
function objectToFieldsForLineProtocol(fieldSet) {
    let result = '';

    if (typeof fieldSet !== 'object') {
        throw new Errors.InvalidType(`Function argument expected to be object, got type ${typeof fieldSet}`);
    }

    Object.keys(fieldSet).forEach(fieldKey => {
        const value = fieldSet[fieldKey];

        if (typeof value === "string") {
            result += `${fieldKey}="${value}",`;
        } else if (typeof value === 'number') {
            if (Number.isFinite(value)) {
                result += `${fieldKey}=${value},`;
            } else {
                throw new Errors.NumberOutOfRange(`Received ${value} where finite number was expecting for a field value`);
            }

        } else if (typeof value === 'boolean') {
            result += `${fieldKey}=${value},`;
        } else {
            throw new Errors.InvalidType(`Received type ${typeof fieldKey} as value where only string, numbers and booleans are accepted`);
        }

    });

    if (result !== '') {
        result = result.substring(0, result.length - 1) // remove trailing "," character
    }

    return result;
}

module.exports = {
    objectToFieldsForLineProtocol,
    objectToTagsForLineProtocol,
    toLineProtocol
};
