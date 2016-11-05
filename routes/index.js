var express = require('express');
var router = express.Router();
var mw = require('../lib/middleware-wrapper');
var loginCtrl = require('../controllers/login-controller');
var registerCtrl = require('../controllers/register-controller');

router.post('/api/register', mw(registerCtrl.register));

router.post('/api/login', mw(loginCtrl.login));

router.post('/api/logout', mw(loginCtrl.logout));

module.exports = router;
