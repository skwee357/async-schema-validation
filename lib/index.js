var validator = require('validator'),
    ValidationError = require('./error'),
    Promise = require('bluebird'),
    _ = require('lodash');

var makeStringRule = function (field, value, rule, options) {
    if (typeof validator[rule] !== "function") throw new Error('Invalid rule type "' + rule + '"');

    options = options || {};

    var args = options.args || [],
        msg = options.msg || 'Value "' + value + '" does not satisfy rule "' + rule + '"';

    args = [value].concat(args);

    return new Promise(function (resolve, reject) {
        var f = validator[rule].apply(validator, args);
        if (f) return resolve();
        return reject({field: field, rule: rule, value: value, msg: msg});
    });
};

var makeCallbackFunction = function (resolve, reject, res) {
    return function (msg) {
        if (typeof msg !== "string") return resolve();
        res.msg = msg;
        return reject(res);
    };
};

var makeCallableRule = function (field, value, rule, name) {
    return new Promise(function (resolve, reject) {
        var res = {field: field, rule: name, value: value, msg: null},
            args = [value, makeCallbackFunction(resolve, reject, res)];

        return rule.apply(rule, args);
    });
};

var validateF = function validate(values, schema) {
    var rules = [];
    _.each(values, function (v, k) {
        if (k in schema) {
            _.each(schema[k], function (r, rk) {
                if (typeof rk === "string") {
                    if (typeof r === "function") {
                        rules.push(makeCallableRule(k, v, r, rk));
                    } else {
                        rules.push(makeStringRule(k, v, rk, r));
                    }
                } else if (typeof r === "string") {
                    rules.push(makeStringRule(k, v, r, null));
                } else {
                    throw new Error('Invalid rule format for rule "' + r + '", "' + rk + '"');
                }
            });
        }
    });

    return new Promise(function (resolve, reject) {
        Promise
            .settle(rules)
            .then(function (results) {
                var errors = _.filter(results, function (r) {
                    return r.isRejected();
                });
                errors = _.map(errors, function(r) {
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