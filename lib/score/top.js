'use strict';

const qs         = require('querystring');
const _          = require('lodash');

const common     = require('../common');
const dataAccess = require('./data');

const Score      = require('../models/Score');
const User       = require('../models/User.js');

const parseData = data => {
    data = data || {};

    data.teamId = data.team_id;
    delete data.team_id;

    let text = data.text.trim().toLowerCase().split(/\s+/);
    const num = _.parseInt(text[0]);

    if(!_.isNaN(num)) {
        data.numEntries = num;
    }

    data.type = 'score';

    if(text.length > 1) {
        if(text[1].toLowerCase() === 'karma') {
            data.type = 'karma';
        }
    }

    return data;
};

module.exports = (event, context, callback) => {
    const data = qs.parse(event.body);

    return common.validateSlackToken(data)
    .then( data => {
        data = parseData(data);
        if(!data.teamId || data.teamId.length === 0) {
            return Promise.reject('no team_id provided');
        }
        if(!_.isNumber(data.numEntries)) {
            return Promise.reject('must provide a number of entries to return');
        }
        return dataAccess.getTopScores(data);
    })
    .then( res => {
        res = res || { Items: [] };

        const noScoresYet = 'No scores yet!';

        const topText = _.reduce(res.Items, (text, user, idx) => {
            if(text == noScoresYet) {
                text = '';
            }
            const points = `${user.score} pts.`;
            const karma = `${user.karma} karma pts.`
            if(idx === 0) {
                text += `:trophy: `;
            } else {
                text += `${idx+1}. `;
            }
            if(data.type === 'karma') {
                text += `@${user.name} ${karma} / ${points} / ${user.streak} streak`;
            } else {
                text += `@${user.name} ${points} / ${karma} / ${user.streak} streak`;
            }
            text += "\n";
            return text;
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
