var seq = require('./seq');
var Sequelize = require('sequelize');

// todo change back to our feed model
var Event = seq.define('event', {
    id : {
        unique: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true
    },
    holderId : {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {isInt: true}
    },
    name : {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {notEmpty: true}
    },
    place : {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {notEmpty: true}
    },
    latitude : {
        type: Sequelize.DOUBLE,
        allowNull: false,
        validate: {isFloat: true}
    },
    longitude : {
        type: Sequelize.DOUBLE,
        allowNull: false,
        validate: {isFloat: true}
    },
    description: {
        type: Sequelize.STRING(1000),
        allowNull: false,
        validate: {notEmpty: true}
    },
    deadlineTime: {
        type: Sequelize.DATE,
        allowNull: false,
        validate: {isDate: true, notEmpty: true}
    },
    startTime: {
        type: Sequelize.DATE,
        allowNull: false,
        validate: {isDate: true, notEmpty: true}
    },
    currentPpl: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {isInt: true, min: 0, max: 20}
    },
    minPpl: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {isInt: true, min: 0, max: 20}
    },
    maxPpl: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {isInt: true, min: 0, max: 20}
    }
});

module.exports = Event;

var User = require('./user');
var ParticipantList = require('./participant-list');

//Event.getParticipants / setParticipants
Event.belongsToMany(User, {
    as: 'participantList',
    through: ParticipantList,
    foreignKey: 'eventId',
    otherKey: 'userId'
});

Event.hasMany(ParticipantList, {
    as: 'attendance',
    foreignKey: 'eventId'
});

Event.belongsTo(User, {
    as: 'holder',
    foreignKey: 'holderId'
});
