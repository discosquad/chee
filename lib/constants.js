'use strict';

const AWS = require('aws-sdk');
const _ = require('lodash');

const encrypted_vars = [
    'SLACK_VERIFICATION_TOKEN',
    'SLACK_CLIENT_ID',
    'SLACK_CLIENT_SECRET',
    'MASHAPE_API_KEY'
];

let decrypted_vars;

const _decrypt = encryptedName => {
    return new Promise( (resolve, reject) => {
        const kms = new AWS.KMS();
        const decrypted = {};
        console.log(`Decrypting ${encryptedName}`);
        kms.decrypt({
            CiphertextBlob: new Buffer(process.env[encryptedName], 'base64')
        }, (err, data) => {
            if (err) {
                console.error('Decrypt error:', err);
                return reject(err);
            }
            decrypted[encryptedName] = data.Plaintext.toString('ascii');
            resolve(decrypted);
        });
    });
};

const _decryptEnvVars = vars => {
    const decryptPromises = _.map(vars, varName => {
        return _decrypt(varName);
    });
    return Promise.all(decryptPromises);
}

module.exports = () => {
    if(decrypted_vars) {
        return Promise.resolve(decrypted_vars);
    }
    return _decryptEnvVars(encrypted_vars)
    .then(vals => {
        decrypted_vars = _.reduce(vals, (result, v, k) => {
            return result[k] = v;
        }, {});
        return decrypted_vars;
    });
};
