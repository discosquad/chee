'use strict';

const _ = require('lodash');
const uuidv4 = require('uuid/v4');

class Score {

    static Factory(data) {
        let score;
        try {
            score = new Score(Score.ValidateData(data));
        } catch (ex) {
            throw ex;
        }
        return score;
    };

    static ValidateData(data) {
        data = data || {};
        if(!data.user_name) {
            throw new Error('no user_name provided');
        }
        if(!_.isNumber(data.score)) {
            throw new Error('no score sent');
        }
        if(!data.text || data.text.length === 0) {
            throw new Error('no reason provided, please give a reason');
        }
        return data;
    };

    static ReasonSeperators() {
        return /(for|because|when)/i;
    };

    constructor(rawData) {
        this.value = rawData.score;
        this.submitterName = rawData.user_name;
        this.date = rawData.date;
        this.parseRawText(rawData.text);
    }

    parseRawText(rawText) {
        rawText = unescape(rawText);
        let splitText = rawText.split(Score.ReasonSeperators());
        if(splitText.length < 3) {
            throw new Error('you must provide a user, the word "for" and a reason for the karma');
        }
        const user = splitText.shift().trim();
        if(user.length === 0) {
            throw new Error('you must provide a user to give karma to');
        }
        this.userName = user;
        this.reason = splitText[1].trim();
    };

    set submitterName(userName) {
        this._submitterName = userName.match(/^\@*(.*)/)[1].trim().toLowerCase();
    };
    get submitterName() {
        return this._submitterName;
    };

    set score(newScore) {
        if(Math.abs(newScore) === 1) {
            this._value = newScore;
        }
    };
    get score() {
        return this._value;
    };

    set date(newDate) {
        this._dateSubmitted = newDate;
    };
    get date() {
        if(!this._dateSubmitted) {
            this.date = Date.now();
        }
        return this._dateSubmitted;
    };

    set user(newUser) {
        this._user = newUser;
    }
    get user() {
        return this._user || {};
    };

    set submitter(newSubmitter) {
        this._submitter = newSubmitter;
    };
    get submitter() {
        return this._submitter || {};
    };

    toObject() {
        return {
            userId: this.user.id,
            submitterId: this.submitter.id,
            value: this.value,
            reason: this.reason,
            date: this.date
        };
    };
};

module.exports = Score;
