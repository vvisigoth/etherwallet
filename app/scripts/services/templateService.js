'use strict';
const state = require('../../partial/state.html');
const liquidate = require('../../partial/liquidate.html');
const start = require('../../partial/start.html');
const purchase = require('../../partial/buy.html');
const launch = require('../../partial/launch.html');
const mode = require('../../partial/mode.html');
const launchRights = require('../../partial/launchrights.html');
const allowTransfer = require('../../partial/allowtransfer.html');
const transfer = require('../../partial/transfer.html');
const rekey = require('../../partial/rekey.html');
const escape = require('../../partial/escape.html');
const adopt = require('../../partial/adopt.html');
const vote = require('../../partial/vote.html');
const createGalaxy = require('../../partial/creategalaxy.html');
const type = require('../../partial/type.html');

var templateService = {
    state: state,
    type: type,
    mode: mode,
    transfer: transfer,
    rekey: rekey,
    launchRights: launchRights,
    allowTransfer: allowTransfer,
    liquidate: liquidate,
    start: start,
    adopt: adopt,
    vote: vote,
    purchase: purchase,
    launch: launch,
    escape: escape,
    createGalaxy: createGalaxy
};

module.exports = templateService;
