'use strict';
const qs         = require('querystring');
const _          = require('lodash');

const common     = require('../common');
const dataAccess = require ('./data');
const Score      = require('../models/Score');
const User       = require('../models/User.js');
const Errors     = require('../models/Error');
const config     = common.getConfig();

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
        if(score.isSelfVote) {
            score.user.addKarma(-3);
        } else {
            score.submitter.addKarma(score.score);
        }
        score.user.addScore(score.score);
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
        let msg;

        res.submitter.karmaEmoji = common.getKarmaEmoji(res.submitter.karma);

        if(res.isSelfVote) {
            msg = _.template(config.selfvote.template)(res);
        } else {
            msg = _.template(config.upvote.template)(res);
        }
        callback(null, common.createResponse({
            statusCode: 200,
            body: {
                response_type: 'in_channel',
                text: `${msg}`
            }
        }));
    })
    .catch(err => {
        callback(null, common.createResponse({
            statusCode: 200,
            body: {
                text: `Sorry, there was an error: ${err.message}`
            }
        }));
    });
};

module.exports = {
    plus:  _.partial(handler, true),
    minus: _.partial(handler, false)
};

