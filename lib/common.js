'use strict';

const AWS = require('aws-sdk');

const _createResponse = rawResp => {
    rawResp = rawResp || {
        statusCode: 200,
        body: '{}'
    };
    return {
        body: JSON.stringify(rawResp.body),
        statusCode: rawResp.statusCode
    };
};

const _checkSlackToken = params => {
    params = params || {};
    return Promise.resolve((params.token !== undefined && process.env.SLACK_VERIFICATION_TOKEN !== undefined && params.token === process.env.SLACK_VERIFICATION_TOKEN));
};

const _handleSlackToken = params => {
    return _checkSlackToken(params)
    .then( isok => {
        if(isok !== true) {
            const err = new Error('bad slack token, or no token provided')
            console.error(err);
            return Promise.reject(err);
        }
        return Promise.resolve(params);
    });
};

module.exports = {
    createResponse: _createResponse,
    validateSlackToken: _handleSlackToken
}
