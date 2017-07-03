'use strict';

const _ = require('lodash');
const uuidv4 = require('uuid/v4');
const User = require('./User');

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
        if(!data.team_id) {
            throw new Error('no team_id provided');
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
        this.score = rawData.score || rawData.value;
        this.teamId = rawData.team_id;
        this.submitter = User.Factory({
            name: rawData.user_name,
            teamId: rawData.team_id
        });
        this.date = rawData.date;
        this.parseRawText(rawData.text);
    }

    parseRawText(rawText) {
        rawText = unescape(rawText);
        let splitText = rawText.split(Score.ReasonSeperators());
        if(splitText.length < 3) {
            throw new Error('you must provide a user, the word "for" and a reason for the karma');
        }
        const userName = splitText.shift().trim();
        if(userName.length === 0) {
            throw new Error('you must provide a user to give karma to');
        }
        this.user = User.Factory({
            name: userName,
            teamId: this.teamId
        });
        this.reason = splitText[1].trim();
    };

    set score(newScore) {
        if(Math.abs(newScore) === 1) {
            this._value = newScore;
        } else {
            this._value = 0;
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

    toObject() {
        return {
            teamId: this.teamId,
            userId: this.user.id,
            submitterId: this.submitter.id,
            value: this.score,
            reason: this.reason,
            date: this.date
        };
    };
};

module.exports = Score;
