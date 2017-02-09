var seq = require('./seq');
var Sequelize = require('sequelize');

var ParticipantList = seq.define('ParticipantList', {
    id : {
        unique: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true
    },
    userId : Sequelize.INTEGER,
    eventId : Sequelize.INTEGER,
    attendence: Sequelize.BOOLEAN
});

module.exports = ParticipantList;

var Event = require('./event');
ParticipantList.belongsTo(Event, {
    foreignKey: 'eventId'
});

var User = require('./user');
ParticipantList.belongsTo(User, {
    foreignKey: 'userId'
});