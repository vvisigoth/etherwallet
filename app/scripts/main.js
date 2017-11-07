'use strict';
require('./localStoragePolyfill');
var angular                  = require('angular');
var angularTranslate         = require('angular-translate');
var angularTranslateErrorLog = require('angular-translate-handler-log');
var angularSanitize          = require('angular-sanitize');
var angularAnimate           = require('angular-animate');
var angularRoute             = require('angular-route');
var bip39                    = require('bip39');
var HDKey                    = require('hdkey');
window.hd                    = { bip39: bip39, HDKey: HDKey };
var BigNumber                = require('bignumber.js');
window.BigNumber             = BigNumber;
var marked                   = require('./staticJS/customMarked');
window.marked                = marked;
var ethUtil                  = require('ethereumjs-util');
ethUtil.crypto               = require('crypto');
ethUtil.Tx                   = require('ethereumjs-tx');
ethUtil.scrypt               = require('scryptsy');
ethUtil.uuid                 = require('uuid');
ethUtil.solidityCoder        = require('./solidity/coder');
ethUtil.solidityUtils        = require('./solidity/utils');
ethUtil.WAValidator          = require('wallet-address-validator');
window.ethUtil               = ethUtil;
var format                   = require('string-format');
window.format                = format;
var browser                  = require('detect-browser');
window.browser               = browser;
var Wallet                   = require('./myetherwallet');
window.Wallet                = Wallet;
var Web3Wallet               = require('./web3Wallet');
window.Web3Wallet            = Web3Wallet;
var Token                    = require('./tokenlib');
window.Token                 = Token;
var globalFuncs              = require('./globalFuncs');
window.globalFuncs           = globalFuncs;
var uiFuncs                  = require('./uiFuncs');
window.uiFuncs               = uiFuncs;
var etherUnits               = require('./etherUnits');
window.etherUnits            = etherUnits;
var ajaxReq                  = require('./ajaxReq');
window.ajaxReq               = ajaxReq;
var nodes                    = require('./nodes');
window.nodes                 = nodes;
var ethFuncs                 = require('./ethFuncs');
window.ethFuncs              = ethFuncs;
var Validator                = require('./validator');
window.Validator             = Validator;
var bity                     = require('./bity');
window.bity                  = bity;
var translate                = require('./translations/translate.js');
var u2f                      = require('./staticJS/u2f-api');
var ledger3                  = require('./staticJS/ledger3');
var ledgerEth                = require('./staticJS/ledger-eth');
var trezorConnect            = require('./staticJS/trezorConnect');
var digitalBitboxUsb         = require('./staticJS/digitalBitboxUsb');
var digitalBitboxEth         = require('./staticJS/digitalBitboxEth');
window.u2f                   = u2f;
window.Ledger3               = ledger3;
window.ledgerEth             = ledgerEth;
window.TrezorConnect         = trezorConnect.TrezorConnect;
window.DigitalBitboxUsb      = digitalBitboxUsb;
window.DigitalBitboxEth      = digitalBitboxEth;
var tabsCtrl                 = require('./controllers/tabsCtrl');
var viewCtrl                 = require('./controllers/viewCtrl');
var decryptWalletCtrl        = require('./controllers/decryptWalletCtrl');
var globalService            = require('./services/globalService');
var walletService            = require('./services/walletService');
var templateService          = require('./services/templateService');
var obService                = require('./services/nom.js');
var addressFieldDrtv         = require('./directives/addressFieldDrtv');
var QRCodeDrtv               = require('./directives/QRCodeDrtv');
var walletDecryptDrtv        = require('./directives/walletDecryptDrtv');
var fileReaderDrtv           = require('./directives/fileReaderDrtv');
var urbitCtrl                = require('./controllers/urbitCtrl');
var app = angular.module('mewApp', ['pascalprecht.translate', 'ngSanitize','ngAnimate', 'ngRoute']);
app.config(['$compileProvider', function($compileProvider) {
  //$compileProvider.aHrefSanitizationWhitelist(/^\s*(|blob|https|mailto):/);
  //add http to whitelist just for dev
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(|blob|https|http|mailto):/);

}]);
app.config(['$translateProvider', function($translateProvider) {
  $translateProvider.useMissingTranslationHandlerLog();
  new translate($translateProvider);
}]);
app.config(['$animateProvider', function($animateProvider) {
    $animateProvider.classNameFilter(/^no-animate$/);
}]);
app.factory('globalService', ['$http', '$httpParamSerializerJQLike', globalService]);
app.factory('walletService', walletService);
app.factory('templateService', templateService);
app.factory('obService', function() {return obService});
app.directive('addressField', ['$compile', addressFieldDrtv]);
app.directive('qrCode', QRCodeDrtv);
app.directive('onReadFile', fileReaderDrtv);
app.directive('walletDecryptDrtv', walletDecryptDrtv);
app.controller('tabsCtrl', ['$scope', 'globalService', '$translate', '$sce', '$location', tabsCtrl]);
app.controller('viewCtrl', ['$scope', 'globalService', '$sce', viewCtrl]);
app.controller('decryptWalletCtrl', ['$scope', '$sce', '$location', 'walletService', decryptWalletCtrl]);
//app.controller('urbitCtrl', ['$scope', '$sce', 'walletService', 'templateService', urbitCtrl]);
app.controller('urbitCtrl', ['$scope', '$sce', '$routeParams', '$location', 'walletService', urbitCtrl]);
app.controller('urbitCtrl', ['$scope', '$sce', '$routeParams', '$location', 'walletService', 'obService', urbitCtrl]);
app.config(['$routeProvider', '$locationProvider', 
    function($routeProvider, $locationProvider) {
    console.log('templateService', templateService);
    $routeProvider
        .when('/', {
            template: templateService.state,
            controller: 'urbitCtrl'
        })
        .when('/state/:p/liquidate', {
            template: templateService.liquidate,
            controller: 'urbitCtrl'
        })
        .when('/state/:p/launch', {
            template: templateService.launch,
            controller: 'urbitCtrl'
        })
        .when('/state/:p/start', {
            template: templateService.start,
            controller: 'urbitCtrl'
        })
        .when('/state/:p/purchase', {
            template: templateService.purchase,
            controller: 'urbitCtrl'
        })
        .when('/state/creategalaxy', {
            template: templateService.createGalaxy,
            controller: 'urbitCtrl'
        })
        .when('/mode/type', {
            template: templateService.type
            //controller: 'urbitCtrl'
        })
        .when('/state', {
            template: templateService.state,
            controller: 'urbitCtrl'
        })
    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');
}]);
