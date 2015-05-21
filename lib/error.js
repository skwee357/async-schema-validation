var util = require('util');

var ValidationErrorF = function ValidationError(message, errors) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.errors = errors;
};

util.inherits(ValidationErrorF, Error);

module.exports = ValidationErrorF;