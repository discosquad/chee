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
        this.teamId = rawData.teamId || rawData.team_id;
        this.name = rawData.name;
        this.score = rawData.score;
        this.karma = rawData.karma;
    };

    set name(newName) {
        this._name = newName.trim().replace('@','').toLowerCase();
    };
    get name() {
        return this._name;
    }

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
            team_id: this.teamId,
            name: this.name,
            score: this.score,
            karma: this.karma
        };
    };

}

module.exports = User;
