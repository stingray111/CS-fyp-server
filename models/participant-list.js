var seq = require('./seq');
var Sequelize = require('sequelize');

var ParticipantList = seq.define('participantList', {
    id : {
        unique: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true
    },
    userId : {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {isInt: true}
    },
    eventId : {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {isInt: true}
    },
    attendance: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    }
});

module.exports = ParticipantList;

var Event = require('./event');
ParticipantList.belongsTo(Event, {
    //as: 'attendance',
    foreignKey: 'eventId'
});

var User = require('./user');
ParticipantList.belongsTo(User, {
    foreignKey: 'userId'
});