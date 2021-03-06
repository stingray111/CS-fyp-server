var seq = require('./seq');
var Sequelize = require('sequelize');

var LoginStatus = seq.define('loginStatus', {
    id : {  //this is actually the token
        primaryKey: true,
        field: 'id',
        type: Sequelize.STRING(1024),
        allowNull: false
    },
    userId : {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {isInt: true}
    },
    userId: Sequelize.INTEGER,
    ipaddr: Sequelize.STRING,
    platform: Sequelize.STRING,
    msgToken: Sequelize.STRING(1024) 
});

module.exports = LoginStatus;

var User = require('./user');
LoginStatus.belongsTo(User, {foreignKey: 'userId'});
