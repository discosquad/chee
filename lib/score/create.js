'use strict';

const AWS = require('aws-sdk');
const dynamodb = require('serverless-dynamodb-client');
const common = require('../common');
const docClient = dynamodb.doc;
const _ = require('lodash');
const Score = require('../models/Score');

const validateData = data => {
    data = data || {};
    if(!data.user_name) {
        return Promise.reject(new Error('no user_name provided'));
    }
    if(!_.isNumber(data.score)) {
        return Promise.reject(new Error('no score sent'));
    }
    if(!data.text || data.text.length === 0) {
        return Promise.reject(new Error('no reason provided, please give a reason'));
    }
    return Promise.resolve(data);
};

const createScore = data => {
    let score;
    try {
        score = new Score(data);
    } catch (ex) {
        return Promise.reject(ex);
    }
    return Promise.resolve(score);
};

const saveScore = score => {
    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Item: score.toObject()
    };
    return new Promise( (resolve, reject) => {
        docClient.put(params, (err, data) =>{
            if(err) {
                return reject(err);
            }
            return resolve(score);
        });
    });
};

const getScoresForUser = user => {
    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        KeyConditionExpression: '#user = :user',
        ExpressionAttributeValues: {
            ':user': user
        },
        ExpressionAttributeNames: {
            '#user': 'user'
        }
    };
    return new Promise( (resolve, reject) => {
        docClient.query(params, function(err, data) {
            if (err) {
                return reject(err);
            }
            data.user = user;
            resolve(data);
        });
    });
};

module.exports = data => {
    return validateData(data)
    .then(createScore)
    .then(saveScore)
    .then( savedScore => {
        return getScoresForUser(savedScore.user);
    });
};
