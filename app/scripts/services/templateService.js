'use strict';
const state = require('../../partial/state.html');
const test2 = require('../../partial/test2.html');
const liquidate = require('../../partial/liquidate.html');
const type = require('../../partial/type.html');

var templateService = {
    state: state,
    t2: test2,
    type: type,
    liquidate: liquidate
};

module.exports = templateService;
