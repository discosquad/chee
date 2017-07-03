'use strict';
const _      = require('lodash');
const create = require('./create');
const top    = require('./top');
const list   = require('./list');

module.exports = _.merge(create, {
    top: top
});
