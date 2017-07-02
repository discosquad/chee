'use strict';

const _ = require('lodash');
const uuidv4 = require('uuid/v4');

class User {

    static Factory(data) {
        data = data || {};
        let user;
        try {
            user = new User(data);
        } catch (ex) {
            throw ex;
        }
        return user;
    };

    constructor(rawData) {
        rawData = rawData || {};
        this.id = rawData.id;
        this.name = rawData.name;
        this.score = rawData.score;
        this.karma = rawData.karma;
    };

    set id(newId) {
        this._id = newId;
    }
    get id() {
        if(!this._id) {
            this._id = uuidv4();
        }
        return this._id;
    };

    set score(newScore) {
        this._score = newScore;
    };
    get score() {
        return this._score || 0;
    };

    set karma(newKarma) {
        this._karma = newKarma;
    };
    get karma() {
        return this._karma || 0;
    };

    toObject() {
        return {
            id: this.id,
            name: this.name,
            score: this.score,
            karma: this.karma
        };
    };

}

module.exports = User;
