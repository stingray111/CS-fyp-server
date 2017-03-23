var express = require('express');
var router = express.Router();
var mw = require('../lib/middleware-wrapper');
var loginCtrl = require('../controllers/login-controller');
var registerCtrl = require('../controllers/register-controller');
var eventCtrl = require('../controllers/event-controller');
var userCtrl = require('../controllers/user-controller');
var thirdPartyCtrl = require('../controllers/third-party-sign-in.js');


router.post('/api/register', mw(registerCtrl.register));

router.post('/api/forget-password', mw(registerCtrl.forgetPassword));

router.post('/api/post-rate', mw(userCtrl.postRate));

router.post('/api/post-self-rate', mw(userCtrl.postSelfRate));

router.post('/api/login', mw(loginCtrl.login));

router.post('/api/logout', mw(loginCtrl.logout));

router.post('/api/update-msg-token', mw(loginCtrl.updateToken));

router.post('/api/get-user', mw(userCtrl.getUser));

router.post('/api/get-event', mw(eventCtrl.getEvent));

router.post('/api/get-events', mw(eventCtrl.getEvents));

router.post('/api/push-event', mw(eventCtrl.pushEvent));

router.post('/api/join-event', mw(eventCtrl.joinEvent));

router.post('/api/quit-event', mw(eventCtrl.quitEvent));

router.post('/api/delete-event', mw(eventCtrl.deleteEvent));

router.post('/api/change-attendance', mw(eventCtrl.changeAttendance));

router.post('/api/third-party-sign-in', mw(thirdPartyCtrl.thirdPartySignIn));


module.exports = router;
