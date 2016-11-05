var seq = require('./seq');
var Sequelize = require('sequelize');

// todo change back to our user model
var User = seq.define('User', {
    id : {
        primaryKey: true,
        field: 'id',
        type: Sequelize.INTEGER,
        autoIncrement: true
    },
    userName: Sequelize.STRING,
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    nickName: Sequelize.STRING,
    gender: Sequelize.BOOLEAN,
    proPic: Sequelize.BOOLEAN,
    password: Sequelize.STRING,
    salt: Sequelize.STRING,
    saltDate: Sequelize.DATE,
    description: Sequelize.STRING,
    attendEventNum: Sequelize.INTEGER,
    abcentEventNum: Sequelize.INTEGER,
    holdEventNum: Sequelize.INTEGER,
    email :Sequelize.STRING,
    phone: Sequelize.STRING,
    level: Sequelize.INTEGER
});

module.exports = User;

var Event = require('./event');
var Participation = require('./participant-list');

// user.getHoldinfEvents, setHoldingEvents
User.hasMany(Event, {
    as: 'HoldingEvents',
    foreignKey: 'holderId'
});

// user.getParticipations, setParticipations
User.belongsToMany(Event, {
    as: 'Participations',
    through: Participation,
    foreignKey: 'userId',
    otherKey: 'eventId'
});

var LoginStatus = require('./login-status');
User.hasMany(LoginStatus, {foreignKey: 'userId'});