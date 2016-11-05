var seq = require('./seq');
var Sequelize = require('sequelize');

var LoginStatus = seq.define('LoginStatus', {
    id : {  //this is actually the token
        primaryKey: true,
        field: 'id',
        type: Sequelize.STRING
    },
    userId: Sequelize.INTEGER,
    ipaddr: Sequelize.STRING,
    platform: Sequelize.STRING
});

module.exports = LoginStatus;

var User = require('./user');
LoginStatus.belongsTo(User, {foreignKey: 'userId'});