var seq = require('./seq');
var Sequelize = require('sequelize');

// todo change back to our feed model
var Event = seq.define('Event', {
    id : {
        unique: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true
    },
    holderId : Sequelize.INTEGER,
    name : Sequelize.STRING,
    place : Sequelize.STRING,
    latitude : Sequelize.DOUBLE,
    longitude : Sequelize.DOUBLE,
    description: Sequelize.STRING,
    deadlineTime: Sequelize.DATE,
    startTime: Sequelize.DATE,
    currentPpl: Sequelize.INTEGER,
    minPpl: Sequelize.INTEGER,
    maxPpl: Sequelize.INTEGER
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

Event.belongsTo(User, {
    as: 'holder',
    foreignKey: 'holderId'
});
