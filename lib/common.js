'use strict';

const HEADERS = {
    'Content-Type': 'application/json'
};

const SLACK_VERIFICATION_TOKEN = process.env.SLACK_VERIFICATION_TOKEN;

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
    return (params.token !== undefined && SLACK_VERIFICATION_TOKEN !== undefined && params.token === SLACK_VERIFICATION_TOKEN);
};

const _handleSlackToken = params => {
    if(_checkSlackToken(params)) {
        return true;
    }
    const err = new Error('bad slack token, or no token provided')
    console.error(err);
    return err;
};

module.exports = {
    createResponse: _createResponse,
    handleSlackToken: _handleSlackToken
}
