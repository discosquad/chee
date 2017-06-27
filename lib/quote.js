'use strict';

const common = require('./common');
const unirest = common.unirest;

const QUOTE_TYPES = {
    MOVIES: 'movies',
    FAMOUS: 'famous'
};

const quote = params => {
    params = params || {};

    const slackTokenValid = common.handleSlackToken(params);
    if(slackTokenValid !== true) {
        return slackTokenValid;
    }

    const quoteType = params.text || QUOTE_TYPES.MOVIES;
    const quoteApiURL = `https://andruxnet-random-famous-quotes.p.mashape.com/?cat=${quoteType}&count=1`;


    return new Promise( (resolve, reject) => {
        unirest.get(quoteApiURL)
        .header('X-Mashape-Key', params.mashape_api_key)
        .header('Content-Type', 'application/x-www-form-urlencoded')
        .header('Accept', 'application/json')
        .end(function (result) {
            if(result.statusCode >= 300) {
                return reject(common.createResponse({
                    status: result.status,
                    body: result
                }));
            }
            resolve(common.createResponse({
                body: {
                    response_type: 'in_channel',
                    text: `"${result.body.quote}" - ${result.body.author}`
                },
                status: 200
            }));
        });
    });

};

module.exports = quote;
