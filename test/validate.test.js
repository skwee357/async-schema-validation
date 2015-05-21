var mocha = require('mocha'),
    expect = require('chai').expect,
    validation = require('../lib');

describe('Async schema validation', function () {

    it('should validate schema', function (done) {
        validation
            .validate({
                foo: 'foo',
                lol: 1
            }, {
                foo: ['isAlpha'],
                lol: ['isInt']
            })
            .then(function () {
                done();
            })
            .catch(function (e) {
                done(e);
            });
    });

    it('should fail to validate schema', function (done) {
        var msgFoo = 'Invalid int',
            msgLol = 'lol should be between 3 and 7 characters long';
        validation
            .validate({
                foo: 'aa',
                lol: 1
            }, {
                foo: {
                    isInt: {msg: msgFoo}
                },
                lol: {
                    isAlpha: {},
                    isLength: {
                        msg: msgLol,
                        args: [3, 7]
                    }
                }
            })
            .then(function () {
                throw new Error('should not validate');
            })
            .catch(validation.ValidationError, function (e) {
                expect(e).to.have.property('errors').with.length(3);
                expect(e.errors[0]).to.have.property('field', 'foo');
                expect(e.errors[0]).to.have.property('msg', msgFoo);
                expect(e.errors[0]).to.have.property('rule', 'isInt');

                expect(e.errors[1]).to.have.property('field', 'lol');
                expect(e.errors[1]).to.have.property('rule', 'isAlpha');

                expect(e.errors[2]).to.have.property('field', 'lol');
                expect(e.errors[2]).to.have.property('msg', msgLol);
                expect(e.errors[2]).to.have.property('rule', 'isLength');
                done();
            })
            .catch(function (e) {
                done(e);
            })
    });

    it('should fail on custom rule', function (done) {
        var msg = 'Is not a valid value';

        validation
            .validate({
                foo: 'a'
            }, {
                foo: {
                    isLen: function(value, next) {
                        if(value.length > 3) return next();
                        return next(msg);
                    }
                }
            })
            .then(function () {
                throw new Error('should not validate');
            })
            .catch(validation.ValidationError, function (e) {
                expect(e).to.have.property('errors').with.length(1);

                expect(e.errors[0]).to.have.property('field', 'foo');
                expect(e.errors[0]).to.have.property('msg', msg);
                expect(e.errors[0]).to.have.property('rule', 'isLen');
                done();
            })
            .catch(function (e) {
                done(e);
            })
    })

});