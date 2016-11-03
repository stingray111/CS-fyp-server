var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;
var httpMock = require('node-mocks-http');
var request = require('request-promise');
var rPromise = require('../../lib/resolvable-promise');

// lib
var hasher = require('../../lib/hasher');
var testUtils = require('../../lib/test-utils');
var seqUtils = require('../../lib/seq-utils');

// controller
var registerCtrl = require('../../controllers/register-controller');

// model
var seq = require('../../models/seq');
var User = require('../../models/user');

// todo: check username or email availability

context('register-controller.register()', function () {
    var req, res, now;

    beforeEach(function () {
        req = httpMock.createRequest({
            method: 'POST',
            uri: '/api/follow',
            locals: {
                user: {
                    id: 1
                }
            }
        });
        res = httpMock.createResponse();

        return seqUtils.truncate(seq, User).then(function () {
            console.log('===============test start==================');
        })
    });

    afterEach(function () {
        return seqUtils.truncate(seq, User);
    });

    //unit test: normal case
    it('noraml parameter - register succeed and return no error', function () {
        req.body = {
            username: 'abcdef_fdsf',
            email: 'abc@gmail.com',
            password: 'abcde.@f_fdsf'
        };
        return registerCtrl.register(req, res, rPromise()).then(function () {
            expect(res.statusCode).to.equal(200);
            expect(res._getData()).to.eql({
                err: null
            });
            return User.findAll();
        }).then(function (users) {
            expect(users.length).to.equal(1);
            expect(users[0].username).to.equal('abcdef_fdsf');
            expect(users[0].email).to.equal('abc@gmail.com');
            expect(users[0].password).to.equal(hasher.hash('abcde.@f_fdsf', hasher.hashVal.dbPw));
            expect(users[0].icon).to.equal(null);
            expect(users[0].description).to.equal(null);
            expect(users[0].privacy).to.equal('public');
        });
    });

    //unit test: invalid username
    context('invalid username - register fail and return error', function () {
        testUtils.genTests({
            'null': [null,'usernameShouldNotBeEmpty'],
            'undefined': [undefined,'usernameShouldNotBeEmpty'],
            'empty string': ['','usernameShouldNotBeEmpty'],
            'too long': ['adddddddddddddddddddddsdsfdsfsfdddddddd','usernameWrongFormat'],
            'too short': ['aaa','usernameWrongFormat'],
            'undesired char': ['**333326','usernameWrongFormat']
        }, function ([username, err]) {
            req.body = {
                username: username,
                email: 'abc@gmail.com',
                password: 'abcde.@f_fdsf'
            };
            var p = registerCtrl.register(req, res, rPromise());
            return expect(p).to.be.rejectedWith(err).then(function () {
                return User.findAll();
            }).then(function (users) {
                expect(users.length).to.equal(0);
            });
        });
    });

    //unit test: invalid email
    context('invalid email - register fail and return error', function () {
        testUtils.genTests({
            'null': [null,'emailShouldNotBeEmpty'],
            'undefined': [undefined,'emailShouldNotBeEmpty'],
            'empty string': ['','emailShouldNotBeEmpty'],
            'wrong format': ['I am the king of the world!','emailWrongFormat']
        }, function ([email, err]) {
            req.body = {
                username: 'abcdef_fdsf',
                email: email,
                password: 'abcde.@f_fdsf'
            };
            var p = registerCtrl.register(req, res, rPromise());
            return expect(p).to.be.rejectedWith(err).then(function () {
                return User.findAll();
            }).then(function (users) {
                expect(users.length).to.equal(0);
            });
        });
    });

    //unit test: invalid password
    context('invalid password - register fail and return error', function () {
        testUtils.genTests({
            'null': [null,'passwordShouldNotBeEmpty'],
            'undefined': [undefined,'passwordShouldNotBeEmpty'],
            'empty string': ['','passwordShouldNotBeEmpty'],
            'too long': ['falkfjlk@Fjkjlsavn0/.affkdsaffdafdafklgfsdjgkldsjgkldfgjdfsklgjdflkgjdfklbksdfljdfgjdsflkgjlgjldfksgjsd!','passwordWrongFormat'],
            'too short': ['ffdfs','passwordWrongFormat']
        }, function ([password, err]) {
            req.body = {
                username: 'abcdef_fdsf',
                email: 'abc@gmail.com',
                password: password
            };
            var p = registerCtrl.register(req, res, rPromise());
            return expect(p).to.be.rejectedWith(err).then(function () {
                return User.findAll();
            }).then(function (users) {
                expect(users.length).to.equal(0);
            });
        });
    });

});