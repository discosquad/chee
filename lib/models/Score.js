'use strict';

const _ = require('lodash');
const uuidv4 = require('uuid/v4');

class Score {

    static reasonSeperators() {
        return /(for|because|when)/i;
    };

    constructor(rawData) {
        this.id = uuidv4();
        this.value = rawData.score;
        this.submitter = rawData.user_name;
        this.date = rawData.date;
        this.parseRawText(rawData.text);
    }

    parseRawText(rawText) {
        rawText = unescape(rawText);
        let splitText = rawText.split(Score.reasonSeperators());
        if(splitText.length < 3) {
            throw new Error('you must provide a user, the word "for" and a reason for the karma');
        }
        const user = splitText.shift().trim();
        if(user.length === 0) {
            throw new Error('you must provide a user to give karma to');
        }
        this.user = user;
        this.reason = splitText[1].trim();
    };

    set submitter(userName) {
        this._submitter = userName.match(/^\@*(.*)/)[1].trim().toLowerCase();
    };
    get submitter() {
        return this._submitter;
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

    toObject() {
        return {
            id: this.id,
            value: this.value,
            user: this.user,
            submitter: this.submitter,
            reason: this.reason,
            date: this.date
        }
    };
};

module.exports = Score;
