var validator = require('validator'),
    ValidationError = require('./error'),
    Promise = require('bluebird'),
    _ = require('lodash');

var makeValidatorRule = function (value, field, rule) {
    if (typeof validator[rule.validator] !== "function") throw new Error('Invalid rule type ' + rule.validator);
    var args = rule.args || [],
        msg = rule.msg || 'Value "' + value + '" does not satisfy rule "' + rule.rule + '"';

    args = [value].concat(args);

    return new Promise(function (resolve, reject) {
        var f = validator[rule.validator].apply(validator, args);
        if (f) return resolve();
        return reject({value: value, field: field, msg: msg});
    });
};

var makeRequiredRule = function (value, field, rule) {
    var msg = rule.msg || 'Value is required';
    return new Promise(function (resolve, reject) {
        if (value === undefined) return reject({value: undefined, field: field, msg: msg});
        resolve();
    });
};

var makeCallbackFunction = function (resolve, reject, err) {
    return function (e) {
        if (typeof e === "undefined") return resolve();
        if (e instanceof Error) err.msg = e.message;
        else err.msg = e;
        reject(err);
    };
};

var makeCallableRule = function (value, field, cb) {
    return new Promise(function (resolve, reject) {
        cb.apply(cb, [value, makeCallbackFunction(resolve, reject, {value: value, field: field})]);
    });
};

var validateF = function validate(values, schema) {
    var rules = {};

    _.each(schema, function (ruleSet, field) {
        var value = (field in values) ? values[field] : undefined;
        rules[field] = _.map(ruleSet, function (rule) {
            var t = typeof rule.validator;
            if (t === "undefined") throw new Error('Invalid rule for ' + field);
            if ((t === "string") && (rule.validator === "required")) return makeRequiredRule(value, field, rule);
            if (t === "string") return makeValidatorRule(value, field, rule);
            if (t === "function") return makeCallableRule(value, field, rule.validator);
            throw new Error('Unknown rule type: ' + field + ' ' + rule.validator.toString());
        });
    });

    var promises = _.map(rules, function (ruleSet, field) {
        return Promise.all(ruleSet);
    });

    return new Promise(function (resolve, reject) {
        Promise
            .settle(promises)
            .then(function (results) {
                var errors = _.filter(results, function (r) {
                    return r.isRejected();
                });
                errors = _.map(errors, function (r) {
                    return r.reason();
                });

                if (errors.length !== 0) return reject(new ValidationError('Validation error', errors));
                return resolve();
            });
    });
};

module.exports = {
    ValidationError: ValidationError,
    Validator: validator,
    validate: validateF
};