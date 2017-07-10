'use strict';

const AWS  = require('aws-sdk');
const yaml = require('js-yaml');
const fs   = require('fs');
const path = require('path');
const _    = require('lodash');

let config;

const createResponse = rawResp => {
    rawResp = rawResp || {
        statusCode: 200,
        body: '{}'
    };
    return {
        body: JSON.stringify(rawResp.body),
        statusCode: rawResp.statusCode
    };
};

const checkSlackToken = params => {
    params = params || {};
    return Promise.resolve((params.token !== undefined && process.env.SLACK_VERIFICATION_TOKEN !== undefined && params.token === process.env.SLACK_VERIFICATION_TOKEN));
};

const validateSlackToken = params => {
    return checkSlackToken(params)
    .then( isok => {
        if(isok !== true) {
            return Promise.reject(new Error('bad slack token, or no token provided'));
        }
        return Promise.resolve(params);
    });
};

const getConfig = () => {
    if(!config) {
        const ymlPath = path.join(__dirname, '/../', 'conf', 'config.yml');
        try {
            config = yaml.safeLoad(fs.readFileSync(ymlPath));
        } catch (ex) {
            console.error(ex);
        }
    }
    return config;
};

const getKarmaEmoji = karma => {

    const zeroThreshold = _
    .chain(config.threshold)
    .remove( obj => { return obj.threshold === 0; })
    .pop()
    .value();

    if(karma === 0) {
        return zeroThreshold.emoji;
    }

    const found = _
    .chain(config.threshold)
    .sortBy('threshold')
    .partition( obj => { return obj.threshold > 0 })
    .thru( split => {
        const idx = karma > 0 ? 0 : 1;
        return split[idx];
    })
    .find( (obj, idx, collection) => {
        return (idx === 0 && karma < obj.threshold) ||
            (idx === collection.length - 1 && karma >= obj.threshold) ||
            (karma >= obj.threshold && karma < collection[idx + 1].threshold);
    })
    .get('emoji')
    .value();

    return found || ':question:';
};

module.exports = {
    createResponse,
    validateSlackToken,
    getConfig,
    getKarmaEmoji
}
