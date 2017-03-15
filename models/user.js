var seq = require('./seq');
var Sequelize = require('sequelize');

// todo change back to our user model
var User = seq.define('user', {
    id : {
        unique: true,
        primaryKey: true,
        field: 'id',
        type: Sequelize.INTEGER,
        autoIncrement: true
    },
    userName: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {notEmpty: true}
    },  // todo add regex
    firstName: {
        type: Sequelize.STRING
    },
    lastName: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {notEmpty: true}
    },
    nickName: {
        type: Sequelize.STRING
    },
    gender: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    proPic: Sequelize.BOOLEAN,
    password: {
        type: Sequelize.STRING(1000),
        allowNull: false,
        validate: {notEmpty: true}  // todo add regex
    },
    salt: Sequelize.STRING, //todo use different salt?
    saltDate: Sequelize.DATE,
    description: {
        type: Sequelize.STRING(1000)
        // validate: {notEmpty: true}
    },
    attendEventNum: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    abcentEventNum: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {isInt: true, min: 0}   // todo may crash using literal()
    },
    holdEventNum: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {isInt: true, min: 0}
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {isEmail: true, notEmpty: true}
    },
    phone: {
        type: Sequelize.STRING
    },
    level: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {isInt: true, min: 0}
    },
    isSelfRated: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    selfExtraversion: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 3,
        validate: {isFloat: true, max: 5, min: 0}
    },
    selfAgreeableness: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 3,
        validate: {isFloat: true, max: 5, min: 0}
    },
    selfConscientiousness: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 3,
        validate: {isFloat: true, max: 5, min: 0}
    },
    selfNeuroticism: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 3,
        validate: {isFloat: true, max: 5, min: 0}
    },
    selfOpenness: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 3,
        validate: {isFloat: true, max: 5, min: 0}
    },
    adjustmentExtraversionWeightedSum: {
        type: Sequelize.INTEGER,
        validate: {isInt: true, min: 0}
    },
    adjustmentAgreeablenessWeightedSum: {
        type: Sequelize.INTEGER,
        validate: {isInt: true, min: 0}
    },
    adjustmentConscientiousnessWeightedSum: {
        type: Sequelize.INTEGER,
        validate: {isInt: true, min: 0}
    },
    adjustmentNeuroticismWeightedSum: {
        type: Sequelize.INTEGER,
        validate: {isInt: true, min: 0}
    },
    adjustmentOpennessWeightedSum: {
        type: Sequelize.INTEGER,
        validate: {isInt: true, min: 0}
    },
    adjustmentWeight: {
        type: Sequelize.INTEGER,
        validate: {isInt: true, min: 0}
    },
    msgToken: {
        type: Sequelize.STRING(1000),
        allowNull: false
        //validate: {notEmpty: true}
    }
    
/*
    acType:{
        type: Sequelize.INTEGER
    },
    facebookId{
    */
    
    
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
