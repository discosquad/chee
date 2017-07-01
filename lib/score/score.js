'use strict';

const qs = require('querystring');
const create = require('./create');
const common = require('../common');
const _ = require('lodash');

const handler = (type, event, context, callback) => {
    const data = qs.parse(event.body);

    data.score = (type === true) ? 1 : -1

    return common.validateSlackToken(data)
    .then(create)
    .then( res => {
        const userScore =  _.reduce(res.Items, (total, score) => {
            return total + score.value;
        }, 0);
        callback(null, common.createResponse({
            statusCode: 200,
            body: {
                response_type: 'in_channel',
                text: `${res.user} now has ${userScore} points`
            }
        }));
    })
    .catch(err => {
        callback(err);
    })
};

module.exports = {
    plus: _.partial(handler, true),
    minus: _.partial(handler, false)
};
