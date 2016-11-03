var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;
var httpMock = require('node-mocks-http');
var request = require('request-promise');
var rPromise = require('../../lib/resolvable-promise');

// lib
var hasher = require('../../lib/hasher');
var seqUtils = require('../../lib/seq-utils');
var testUtils = require('../../lib/test-utils');

// controller
var loginCtrl = require('../../controllers/login-controller');

// model
var seq = require('../../models/seq');
var User = require('../../models/user');
var LoginStatus = require('../../models/login-status');

context('login-controller.login()', function () {
    var req, res, now;

    beforeEach(function () {
        req = httpMock.createRequest({
            method: 'POST',
            uri: '/api/login',
            locals: {}
        });
        res = httpMock.createResponse();
        now = Date.now();

        return seqUtils.truncate(seq, User, LoginStatus).then(function () {
            return User.create({
                username: 'abc',
                password: hasher.hash('abc', hasher.hashVal.dbPw),
                email: 'abc@gmail.com'
            });
        }).then(function () {
            console.log('===============test start==================');
        });
    });

    afterEach(function () {
        return seqUtils.truncate(seq, User, LoginStatus);
    });

    //unit test: normal
    it('normal parameter - check username and password in DB, add loginStatus to DB', function () {
        req.body = {
            usernameOrEmail: 'abc',
            password: 'abc',
            ip: '192.5.22.222',
            platform: 'AND'
        };
        return loginCtrl.login(req, res, rPromise()).then(function () {
            expect(res.statusCode).to.equal(200);
            expect(res._getData()).to.eql({
                err: null,
                token: req.locals.testing.token //todo: change to calculated one
            });
            return LoginStatus.findAll();
        }).then(function (loginStatuses) {
            expect(loginStatuses.length).to.equal(1);
            expect(loginStatuses[0].userId).to.equal(1);
            expect(loginStatuses[0].ipaddr).to.equal('192.5.22.222');
            expect(loginStatuses[0].platform).to.equal('AND');
        });
    });

    //unit test: invalid parameter -> user wrong input
    context('invalid username - return err: userNotfound and create no loginStatus', function () {
        testUtils.genTests({
            'wrong username': 'nnn',
            'wrong email': 'nnn@gmail.com'
        }, function (usernameOrEmail) {
            req.body = {
                usernameOrEmail: usernameOrEmail,
                password: 'abc',
                ip: '192.165.222.222',
                platform: 'AND'
            };
            return loginFailAndNoLoginStatusCreated('userNotfound');
        })
    });

    //unit test: invalid parameter -> user wrong input
    it('invalid password - return err: passwordWrong and create no loginStatus', function () {
        req.body = {
            usernameOrEmail: 'abc@gmail.com',
            password: '11111',
            ip: '192.165.222.222',
            platform: 'WEB'
        };
        return loginFailAndNoLoginStatusCreated('passwordWrong');
    });

    //unit test: invalid parameter -> invalid format
    context('invalid username - return internal err and create no loginStatus', function () {
        testUtils.genTests({
            'null': null,
            'undefined': undefined,
            'empty string': '',
            'non string': 1234
        }, function (username) {
            req.body = {
                usernameOrEmail: username,
                password: 'abc',
                ip: '192.165.222.222',
                platform: 'AND'
            };
            return errorExpectedAndNoLoginStatusCreated();
        });
    });

    //unit test: invalid parameter -> invalid format
    context('invalid password - return internal err and create no loginStatus', function () {
        testUtils.genTests({
            'null': null,
            'undefined': undefined,
            'empty string': '',
            'non string': 1234
        }, function (password) {
            req.body = {
                usernameOrEmail: 'abc',
                password: password,
                ip: '192.165.222.222',
                platform: 'AND'
            };
            return errorExpectedAndNoLoginStatusCreated();
        });
    });

    //unit test: invalid parameter -> invalid format
    context('invalid ip - return internal err and create no loginStatus', function () {
        testUtils.genTests({
            'null': null,
            'undefined': undefined,
            'empty string': '',
            'wrong ip format': '192.111'
        }, function (ip) {
            req.body = {
                usernameOrEmail: 'abc',
                password: 'abc',
                ip: ip,
                platform: 'AND'
            };
            return errorExpectedAndNoLoginStatusCreated();
        });
    });

    //unit test: invalid parameter -> invalid format
    context('invalid platform - return internal err and create no loginStatus', function () {
        testUtils.genTests({
            'null': null,
            'undefined': undefined,
            'empty string': '',
            'non string': 1234,
            'unsupported platform': 'AAA'   //platform should only be 'AND', 'IOS' or 'WEB'
        }, function (platform) {
            req.body = {
                usernameOrEmail: 'abc',
                password: 'abc',
                ip: '192.165.222.222',
                platform: platform
            };
            return errorExpectedAndNoLoginStatusCreated();
        });
    });

    function loginFailAndNoLoginStatusCreated(errMsg) {
        return loginCtrl.login(req, res, rPromise()).then(function () {
            expect(res.statusCode).to.equal(200);
            expect(res._getData()).to.eql({
                err: errMsg,
                token: null
            });
            return LoginStatus.findAll();
        }).then(function (loginStatuses) {
            expect(loginStatuses.length).to.equal(0);
        });
    }

    function errorExpectedAndNoLoginStatusCreated() {
        return testUtils.controllers.expectRejected(loginCtrl.login(req, res, rPromise()), [LoginStatus]);
    }
});