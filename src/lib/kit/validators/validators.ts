import _ from 'lodash';

import {
    ArraySpec,
    ArrayValue,
    BooleanSpec,
    NumberSpec,
    ObjectSpec,
    ObjectValue,
    StringSpec,
} from '../../core';
import {ErrorMessages} from '../validators';

import {isFloat, isInt} from './helpers';
import {ErrorMessagesType} from './types';

interface CommonValidatorParams {
    ignoreRequiredCheck?: boolean;
    customErrorMessages?: Partial<ErrorMessagesType>;
}

export interface GetArrayValidatorParams extends CommonValidatorParams {
    ignoreMaxLengthCheck?: boolean;
    ignoreMinLengthCheck?: boolean;
}

export const getArrayValidator = (params: GetArrayValidatorParams = {}) => {
    const {ignoreRequiredCheck, ignoreMaxLengthCheck, ignoreMinLengthCheck, customErrorMessages} =
        params;
    const errorMessages = {...ErrorMessages, ...customErrorMessages};

    return (spec: ArraySpec, value?: ArrayValue) => {
        const valueLength = value?.length || 0;

        if (!ignoreRequiredCheck && spec.required && !_.isArray(value)) {
            return errorMessages.REQUIRED;
        }

        if (
            !ignoreMaxLengthCheck &&
            typeof spec.maxLength === 'bigint' &&
            valueLength > spec.maxLength
        ) {
            return errorMessages.maxLengthArr(spec.maxLength);
        }

        if (
            !ignoreMinLengthCheck &&
            typeof spec.minLength === 'bigint' &&
            valueLength < spec.minLength
        ) {
            return errorMessages.minLengthArr(spec.minLength);
        }

        return false;
    };
};

export interface GetBooleanValidatorParams extends CommonValidatorParams {}

export const getBooleanValidator = (params: GetBooleanValidatorParams = {}) => {
    const {ignoreRequiredCheck, customErrorMessages} = params;
    const errorMessages = {...ErrorMessages, ...customErrorMessages};

    return (spec: BooleanSpec, value?: boolean) => {
        if (!ignoreRequiredCheck && spec.required && !value) {
            return errorMessages.REQUIRED;
        }

        return false;
    };
};

export interface GetNumberValidatorParams extends CommonValidatorParams {
    ignoreSpaceStartCheck?: boolean;
    ignoreSpaceEndCheck?: boolean;
    ignoreNumberCheck?: boolean;
    ignoreMaximumCheck?: boolean;
    ignoreMinimumCheck?: boolean;
    ignoreIntCheck?: boolean;
    ignoreDotEnd?: boolean;
    ignoreZeroStart?: boolean;
}

export const getNumberValidator = (params: GetNumberValidatorParams = {}) => {
    const {
        ignoreRequiredCheck,
        ignoreSpaceStartCheck,
        ignoreSpaceEndCheck,
        ignoreNumberCheck,
        ignoreMaximumCheck,
        ignoreMinimumCheck,
        ignoreIntCheck,
        ignoreDotEnd,
        ignoreZeroStart,
        customErrorMessages,
    } = params;
    const errorMessages = {...ErrorMessages, ...customErrorMessages};

    // eslint-disable-next-line complexity
    return (spec: NumberSpec, value: string | number = '') => {
        const stringValue = String(value);

        if (!ignoreRequiredCheck && spec.required && !stringValue.length) {
            return errorMessages.REQUIRED;
        }

        if (stringValue.length) {
            if (!ignoreSpaceStartCheck && !stringValue[0].trim()) {
                return errorMessages.SPACE_START;
            }

            if (!ignoreSpaceEndCheck && !stringValue[stringValue.length - 1].trim()) {
                return errorMessages.SPACE_END;
            }

            if (!ignoreDotEnd && stringValue[stringValue.length - 1] === '.') {
                return errorMessages.DOT_END;
            }

            if (!ignoreNumberCheck && !isFloat(stringValue)) {
                return errorMessages.NUMBER;
            }

            if (
                !ignoreZeroStart &&
                ((stringValue.length > 1 && stringValue[0] === '0' && stringValue[1] !== '.') ||
                    (stringValue.length > 2 &&
                        stringValue.substring(0, 2) === '-0' &&
                        stringValue[2] !== '.'))
            ) {
                return errorMessages.ZERO_START;
            }
        }

        if (
            !ignoreMaximumCheck &&
            _.isNumber(spec.maximum) &&
            stringValue.length &&
            Number(stringValue) > spec.maximum
        ) {
            return errorMessages.maxNumber(spec.maximum);
        }

        if (
            !ignoreMinimumCheck &&
            _.isNumber(spec.minimum) &&
            stringValue.length &&
            spec.minimum > Number(stringValue)
        ) {
            return errorMessages.minNumber(spec.minimum);
        }

        if (_.isString(spec.format) && stringValue.length) {
            if (!ignoreIntCheck && spec.format === 'int64' && !isInt(stringValue)) {
                return errorMessages.INT;
            }
        }

        return false;
    };
};

export interface GetObjectValidatorParams extends CommonValidatorParams {}

export const getObjectValidator = (params: GetObjectValidatorParams = {}) => {
    const {ignoreRequiredCheck, customErrorMessages} = params;
    const errorMessages = {...ErrorMessages, ...customErrorMessages};

    return (spec: ObjectSpec, value?: ObjectValue) => {
        if (!ignoreRequiredCheck && spec.required && !value) {
            return errorMessages.REQUIRED;
        }

        return false;
    };
};

export interface GetStringValidatorParams extends CommonValidatorParams {
    ignoreSpaceStartCheck?: boolean;
    ignoreSpaceEndCheck?: boolean;
    ignoreMaxLengthCheck?: boolean;
    ignoreMinLengthCheck?: boolean;
    ignoreRegExpCheck?: boolean;
}

export const getStringValidator = (params: GetStringValidatorParams = {}) => {
    const {
        ignoreRequiredCheck,
        ignoreSpaceStartCheck,
        ignoreSpaceEndCheck,
        ignoreMaxLengthCheck,
        ignoreMinLengthCheck,
        ignoreRegExpCheck,
        customErrorMessages,
    } = params;
    const errorMessages = {...ErrorMessages, ...customErrorMessages};

    // eslint-disable-next-line complexity
    return (spec: StringSpec, value = '') => {
        const valueLength = value?.length;

        if (!ignoreRequiredCheck && spec.required && !valueLength) {
            return errorMessages.REQUIRED;
        }

        if (valueLength) {
            if (!ignoreSpaceStartCheck && !value[0].trim()) {
                return errorMessages.SPACE_START;
            }

            if (!ignoreSpaceEndCheck && !value[value.length - 1].trim()) {
                return errorMessages.SPACE_END;
            }
        }

        if (
            !ignoreMaxLengthCheck &&
            typeof spec.maxLength === 'bigint' &&
            valueLength > spec.maxLength
        ) {
            return errorMessages.maxLength(spec.maxLength);
        }

        if (
            !ignoreMinLengthCheck &&
            typeof spec.minLength === 'bigint' &&
            valueLength < spec.minLength
        ) {
            return errorMessages.minLength(spec.minLength);
        }

        if (_.isString(spec.pattern) && spec.pattern.length) {
            const regex = new RegExp(spec.pattern);

            if (!ignoreRegExpCheck && !regex.test(value)) {
                return _.isString(spec.patternError) && spec.patternError.length
                    ? spec.patternError
                    : errorMessages.INVALID;
            }
        }

        return false;
    };
};
