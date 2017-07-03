'use strict';

const qs         = require('querystring');
const _          = require('lodash');

const common     = require('../common');
const dataAccess = require('./data');

const Score      = require('../models/Score');
const User       = require('../models/User.js');

module.exports = (event, context, callback) => {
    const data = qs.parse(event.body);

    return common.validateSlackToken(data)
    .then( data => {
        const numEntries = _.parseInt(data.text.trim());
        if(!data.team_id || data.team_id.length === 0) {
            return Promise.reject('no team_id provided');
        }
        if(_.isNaN(numEntries)) {
            return Promise.reject('must provide a number of entries to return');
        }
        return dataAccess.getTopScores(numEntries, data.team_id);
    })
    .then( res => {
        res = res || { Items: [] };
        const noScoresYet = 'No scores yet!';
        const topText = _.reduce(res.Items, (text, user, idx) => {
            if(text == noScoresYet) {
                text = '';
            }
            return text + `${idx+1}. ${user.name} ${user.score} points / ${user.karma} karma` + "\n";
        }, noScoresYet);
        callback(null, common.createResponse({
            statusCode: 200,
            body: {
                response_type: 'in_channel',
                text: topText
            }
        }));
    })
    .catch(err => {
        callback(err);
    })
};
