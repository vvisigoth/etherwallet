'use strict';
const state = require('../../partial/state.html');
const test2 = require('../../partial/test2.html');
const liquidate = require('../../partial/liquidate.html');
const start = require('../../partial/start.html');
const purchase = require('../../partial/buy.html');
const launch = require('../../partial/launch.html');
//const launchRights = require('../../partial/launchrights.html');
//const allowTransfer = require('../../partial/allowtransfer.html');
const transfer = require('../../partial/transfer.html');
const rekey = require('../../partial/rekey.html');
//const escape = require('../../partial/escape.html');
//const adopt = require('../../partial/adopt.html');
//const reject = require('../../partial/reject.html');
//const vote = require('../../partial/vote.html');
const createGalaxy = require('../../partial/creategalaxy.html');
const type = require('../../partial/type.html');

var templateService = {
    state: state,
    t2: test2,
    type: type,
    transfer: transfer,
    rekey: rekey,
    liquidate: liquidate,
    start: start,
    purchase: purchase,
    launch: launch,
    createGalaxy: createGalaxy
};

module.exports = templateService;
