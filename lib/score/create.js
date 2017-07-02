'use strict';

const AWS = require('aws-sdk');
const _ = require('lodash');
const dynamodb = require('serverless-dynamodb-client');

const common = require('../common');
const docClient = dynamodb.doc;

const Score = require('../models/Score');
const User = require('../models/User.js');

const createUser = user => {
    const params = {
        TableName: process.env.DYNAMODB_USER_TABLE,
        Item: user.toObject()
    };
    return new Promise( (resolve, reject) => {
        docClient.put(params, (err, data) => {
            if(err) {
                return reject(err);
            }
            resolve(user);
        });
    });
};

const updateUser = user => {
    const params = {
        TableName: process.env.DYNAMODB_USER_TABLE,
        Key: {
            name : user.name
        },
        UpdateExpression: 'set score = :newScore, karma = :newKarma',
        ExpressionAttributeValues: {
            ':newScore': user.score,
            ':newKarma': user.karma
        }
    };
    return new Promise( (resolve, reject) => {
        docClient.update(params, (err, data) => {
            if(err) {
                console.dir(err);
                return reject(err);
            }
            resolve(user);
        });
    });
};



const getUserByName = userName => {
    const params = {
        TableName: process.env.DYNAMODB_USER_TABLE,
        KeyConditionExpression: '#name = :userName',
        ExpressionAttributeValues: {
            ':userName': userName
        },
        ExpressionAttributeNames: {
            '#name':'name'
        }
    };
    return new Promise( (resolve, reject) => {
        docClient.query(params, function(err, data) {
            if (err) {
                return reject(err);
            }
            if(data && data.Count === 0) {
                return createUser(User.Factory({ name: userName })).then(resolve)
            }
            resolve(User.Factory(data.Items[0]));
        });
    });
};

const saveScore = score => {
    const params = {
        TableName: process.env.DYNAMODB_SCORE_TABLE,
        Item: score.toObject()
    };
    return new Promise( (resolve, reject) => {
        docClient.put(params, (err, data) =>{
            if(err) {
                return reject(err);
            }
            resolve(score);
        });
    });
};

const getScoresForUser = user => {
    const params = {
        TableName: process.env.DYNAMODB_SCORE_TABLE,
        KeyConditionExpression: 'userId = :id',
        ExpressionAttributeValues: {
            ':id': user.id
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
    let score;
    try {
        score = Score.Factory(data);
    } catch (ex) {
        return Promise.reject(ex);
    }
    return getUserByName(score.submitterName)
    .then(submitter => {
        score.submitter = submitter;
        return getUserByName(score.userName);
    })
    .then(user => {
        score.user = user;
        return saveScore(score);
    })
    .then( savedScore => {
        score = savedScore;
        score.submitter.karma += score.value;
        score.user.score += score.value;
        return updateUser(score.submitter)
    })
    .then( () => {
        return updateUser(score.user);
    })
    .then( () => {
        return score;
    });
};
