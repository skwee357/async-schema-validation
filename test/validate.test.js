var mocha = require('mocha'),
    expect = require('chai').expect,
    validation = require('../lib');

describe('Async schema validation', function () {

    it('should validate schema', function (done) {
        var values = {
                foo: 'foo',
                lol: 1
            },
            schema = {
                foo: [{rule: 'isAlpha'}],
                lol: [{rule: 'isInt'}]
            };

        validation
            .validate(values, schema)
            .then(function () {
                done();
            })
            .catch(function (e) {
                done(e);
            });
    });

    it('should fail to validate schema', function (done) {
        var values = {
                foo: 'aa',
                lol: 'aa'
            },
            schema = {
                foo: [{rule: 'isInt', msg: 'Invalid number for foo'}],
                lol: [
                    {rule: 'isAlpha'},
                    {rule: 'isLength', msg: 'lol should be between 3 and 7 characters', args: [3, 7]}
                ]
            };
        validation
            .validate(values, schema)
            .then(function () {
                throw new Error('should not validate');
            })
            .catch(validation.ValidationError, function (e) {
                expect(e).to.have.property('errors').with.length(2);
                expect(e.errors[0]).to.have.property('field', 'foo');
                expect(e.errors[0]).to.have.property('msg', schema.foo[0].msg);

                expect(e.errors[1]).to.have.property('field', 'lol');
                expect(e.errors[1]).to.have.property('msg', schema.lol[1].msg);
                done();
            })
            .catch(function (e) {
                done(e);
            })
    });

    it('should fail on custom rule', function (done) {
        var msg = 'Foo should be even',
            values = {
                foo: 23,
                bar: 'aaa'
            },
            schema = {
                foo: [
                    {rule: function(value) {
                        if(value % 2 != 0) {
                            throw new Error(msg)
                        }
                    }}
                ],
                lol: [{rule: 'required', msg: 'Lol should be present'}]
            };

        validation
            .validate(values, schema)
            .then(function () {
                throw new Error('should not validate');
            })
            .catch(validation.ValidationError, function (e) {
                expect(e).to.have.property('errors').with.length(2);

                expect(e.errors[0]).to.have.property('field', 'foo');
                expect(e.errors[0]).to.have.property('msg', msg);

                expect(e.errors[1]).to.have.property('field', 'lol');
                expect(e.errors[1]).to.have.property('msg', schema.lol[0].msg);
                done();
            })
            .catch(function (e) {
                done(e);
            })
    })

});