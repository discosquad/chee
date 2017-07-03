'use strict';
const qs         = require('querystring');
const _          = require('lodash');

const common     = require('../common');
const dataAccess = require ('./data');
const Score      = require('../models/Score');
const User       = require('../models/User.js');


const createScore = data => {
    let score;
    try {
        score = Score.Factory(data);
    } catch (ex) {
        return Promise.reject(ex);
    }
    return dataAccess.getUserByName(score.submitter)
    .then(submitter => {
        score.submitter = null;
        score.submitter = submitter;
        return dataAccess.getUserByName(score.user);
    })
    .then(user => {
        score.user = null;
        score.user = user;
        return dataAccess.saveScore(score);
    })
    .then( savedScore => {
        score = savedScore;
        score.submitter.karma += score.score;
        score.user.score += score.score;
        return dataAccess.updateUser(score.submitter)
    })
    .then( () => {
        return dataAccess.updateUser(score.user);
    })
    .then( () => {
        return score;
    });
};

const handler = (type, event, context, callback) => {
    const data = qs.parse(event.body);
    data.score = (type === true) ? 1 : -1

    return common.validateSlackToken(data)
    .then(createScore)
    .then( res => {
        callback(null, common.createResponse({
            statusCode: 200,
            body: {
                response_type: 'in_channel',
                text: `${res.user.name} now has ${res.user.score} points, ${res.submitter.name} now has ${res.submitter.karma} karma`
            }
        }));
    })
    .catch(err => {
        callback(err);
    })
};

module.exports = {
    plus:  _.partial(handler, true),
    minus: _.partial(handler, false)
};

