'use strict';

const _ = require('lodash');

class SlackResponse {

    static Factory(raw) {
        raw = raw || {};
        return new SlackResponse(raw);
    };

    constructor(params) {
        params = params || {};
        this.text = params.text;
    };

    addAttachment(attachment) {
        let newAttachment = attachment;
        if(!(attachment instanceof SlackAttachment)) {
            newAttachment = SlackAttachment.Factory(attachment);
        }
        this.attachments.push(newAttachment);
        return this.attachments;
    };

    set attachments(newAttachments) {
        if(!_.isArray(newAttachments)) {
            throw new Error('attachments must be an array');
        }
        this._attachments = newAttachments;
    };
    get attachments() {
        if(!this._attachments) {
            this._attachments = [];
        }
        return this._attachments;
    }

    toObject() {
        return {
            text: this.text || '',
            attachments: _.map(this.attachments, attachment => {
                return attachment.toObject();
            })
        };
    };

};

class SlackAttachment {

    static Factory(raw) {
        raw = raw || {};
        return new SlackAttachment(raw);
    }

    constructor(params) {
        params = params || {};
        this.fallback = params.fallback;
        this.color = params.color;
        this.pretext = params.pretext;
        this.authorName = params.authorName;
        this.authorLink = params.authorLink;
        this.authorIcon = params.authorIcon;
        this.title = params.title;
        this.titleLink = params.titleLink;
        this.text = params.text;
        this.fields = params.fields;
    };

    toObject() {
        return {
            fallback: this.fallback,
            color: this.color,
            pretext: this.pretext,
            authorName: this.authorName,
            authorLink: this.authorLink,
            authorIcon: this.authorIcon,
            title: this.title,
            titleLink: this.titleLink,
            text: this.text,
            fields: this.fields,
        };
    };
};

class SlackAttachmentField {

    constructor(params) {
        this.title = params.title;
        this.value = params.value;
        this.short = params.short;
    };

    set short(isShort) {
        if(!_.isBoolean(isShort)) {
            this._short = true;
        }
        this._short = isShort;
    };
    get short() {
        return this._short || false;
    };

    toObject() {
       return {
            title: this.title,
            value: this.value,
            short: this.short
       };
    };
};

module.exports = SlackResponse;
