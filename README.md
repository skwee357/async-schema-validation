# Async Schema Validation for node.js
Async schema validation for node.js is a validation framework based on promises and [chriso/validator.js](https://github.com/chriso/validator.js)

# Available on NPM
```npm install async-schema-validation```

# Examples
```
var validator = require('async-schema-validation'),
    values = {
        foo: 1, 
        lol: 'abcd',
        bar: 'bar'
    },
    schema: {
        foo: {
            isInt: {msg: 'Invalid foo value'}
        }, 
        lol: {
            isAlpha: {msg: 'Lol should be alphanumeric'}, 
            isLength: {msg: 'Lol should be between 3 and 7 characters, args: [3, 7]}
        },
        bar: {
            customRule: function(value, cb) {
                if(value !== 'bar') return cb('Bar should equal bar');
                cb();
            }
        }
    };

validator
    .validate(values, schema)
    .then(function() {
        ...
    })
    .catch(validator.ValidationError, function(e) {
        /**
            {
                name: 'ValidationError',
                message: 'Validation error',
                errors: [
                    {
                        field: 'fieldKey',
                        rule: 'ruleName',
                        value: 'fieldValue',
                        msg: 'Failure message'
                    },
                    {..},
                    ..
                ]
            }
        */
    });
```