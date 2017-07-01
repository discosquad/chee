'use strict';

const _ = require('lodash');

class CCL  {

    static BaseURL() {
        return 'https://s3.amazonaws.com/tds-slack/ccliters';
    };

    constructor(key) {
        this.fileName = key.replace('ccliters/','');
        this.fileType = this.fileName.split('.').pop();
        this.keywords = this.fileName.split(/\-|\./).slice(1,-1);
        if(this.keywords.length === 0) {
            this.keywords = this.fileName;
        }
    };

    matches(term) {
        return _.find(this.keywords, keyword => {
            return keyword == term;
        });
    };

    slackMessage() {
        return {
            response_type: 'in_channel',
            text: '',
            attachments: [
            {
                fallback: `${this.fileName}`,
                image_url: `${CCL.BaseURL()}/${this.fileName}`
            }
            ]
        }
    };

};

module.exports = CCL;
