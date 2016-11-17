var User = require('../models/user');
var sequelize = require('sequelize');

exports.getUser = function (req, res, promise) {
    console.log(req.body);

    User.findOne({
        where:{
            id: req.body.userId
        }
    }).then(function (user) {
        console.log(user.dataValues);
        res.send({
            errorMsg: null,
            user: user
        });
        promise.resolve();
    }).catch(function (e) {
        promise.reject();
    });
    return promise;
};