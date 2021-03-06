'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const fs = require('fs');
const qs = require('querystring');
const _ = require('lodash');

const common = require('../common');
const CCL = require('../models/CCL');

const listBucketKeys = () => {
    const s3 = new AWS.S3();
    const s3opts = {
        Bucket: 'tds-slack',
        Prefix: 'ccliters'
    };
    return new Promise( (resolve, reject) => {
        s3.listObjects(s3opts, (err, data) => {
            if(err !== null || !data.Contents || data.Contents.length === 0) {
                return reject(err);
            }
            const keys = _.map(data.Contents, 'Key');
            const ccls = _.map(keys, key => {
                return new CCL(key);
            });
            resolve(ccls);
        });
    });
};

const searchKeys = (ccls, searchTerm) => {
    let foundCCLs = ccls;
    if(searchTerm !== null) {
        foundCCLs = _.filter(ccls, ccl => {
            return ccl.matches(searchTerm);
        });
    }
    if(foundCCLs.length === 0) {
        return common.createResponse({
            statusCode: 200,
            body: {
                response_type: 'in_channel',
                text: 'no-no-no CCL found!'
            }
        });
    }
    const ccl = _.sample(foundCCLs);
    return common.createResponse({
        statusCode: 200,
        body: ccl.slackMessage()
    });
};

module.exports.do = (event, context, callback) => {
    const data = qs.parse(event.body);
    return common.validateSlackToken(data)
    .then(listBucketKeys)
    .then( ccls => {
        const searchTerm = data.text || null;
        return searchKeys(ccls, searchTerm)
    })
    .then( response => {
        callback(null, response);
    })
    .catch( err => {
        callback(err);
    });
};
