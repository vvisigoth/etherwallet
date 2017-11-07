'use strict';
const state = require('../../partial/state.html');
const test2 = require('../../partial/test2.html');
const liquidate = require('../../partial/liquidate.html');
const start = require('../../partial/start.html');
const purchase = require('../../partial/buy.html');
const launch = require('../../partial/launch.html');
const createGalaxy = require('../../partial/creategalaxy.html');
const type = require('../../partial/type.html');

var templateService = {
    state: state,
    t2: test2,
    type: type,
    liquidate: liquidate,
    start: start,
    purchase: purchase,
    launch: launch,
    createGalaxy: createGalaxy
};

module.exports = templateService;
