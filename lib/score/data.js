'use strict';

const AWS       = require('aws-sdk');
const _         = require('lodash');
const dynamodb  = require('serverless-dynamodb-client');

const common    = require('../common');
const Score     = require('../models/Score');
const User      = require('../models/User.js');

const docClient = dynamodb.doc;

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
            team_id: user.teamId,
            name: user.name
        },
        UpdateExpression: 'set score = :newScore, karma = :newKarma, streak = :newStreak',
        ConditionExpression: '#name = :name',
        ExpressionAttributeValues: {
            ':name': user.name,
            ':newScore': user.score,
            ':newKarma': user.karma,
            ':newStreak': user.streak
        },
        ExpressionAttributeNames: {
            '#name':'name'
        }
    };
    return new Promise( (resolve, reject) => {
        docClient.update(params, (err, data) => {
            if(err) {
                return reject(err);
            }
            resolve(user);
        });
    });
};

const getUserByName = user => {
    const params = {
        TableName: process.env.DYNAMODB_USER_TABLE,
        KeyConditionExpression: 'team_id = :teamId AND #name = :userName',
        ExpressionAttributeValues: {
            ':userName': user.name,
            ':teamId': user.teamId
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
                return createUser(user).then(resolve)
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

const getTopScores = (data) => {
    data.type = data.type || 'score';

    const params = {
        TableName: process.env.DYNAMODB_USER_TABLE,
        KeyConditionExpression: 'team_id = :id',
        ScanIndexForward: false,
        IndexName: data.type == 'karma' ? 'users-team-karma' : 'users-team-score',
        Limit: data.numEntries || 1,
        ExpressionAttributeValues: {
            ':id': data.teamId
        },
        ExpressionAttributeNames: {
            '#name': 'name'
        },
        ProjectionExpression: [
            '#name',
            'score',
            'karma',
            'streak'
        ]
    };

    return new Promise( (resolve, reject) => {
        docClient.query(params, function(err, data) {
            if (err) {
                return reject(err);
            }
            resolve(data);
        });
    });
};

module.exports = {
    getScoresForUser,
    saveScore,
    getUserByName,
    getTopScores,
    updateUser,
    createUser
};
