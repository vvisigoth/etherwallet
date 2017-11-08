<!DOCTYPE html>
<html lang="en" ng-app="mewApp">
<head>
<meta charset="utf-8">
<title>My Urbit Wallet</title>
<meta name="description" content="MyUrbitWallet.com is a free, open-source, client-side interface for generating Ethereum wallets &amp; interacting with the blockchain easily &amp; securely. Double-check the URL ( .com ) before unlocking your wallet.">
<!--
<link rel="canonical" href="https://www.myetherwallet.com" />
-->
<meta name="viewport" content="width=device-width, initial-scale=1">
<!--
<link rel="stylesheet" href="css/base.css">
-->
<link rel="stylesheet" href="css/urbitwallet-master.min.css">
<base href="/">
<!-- USE THIS DURING DEV TO HIDE CRUFT -->
<link rel="stylesheet" href="css/dev.css">
<link href="https://fonts.googleapis.com/css?family=Work+Sans:100,200,300,400,500,600,700,800,900" rel="stylesheet">
<script type="text/javascript" src="js/etherwallet-static.min.js"></script>
<script type="text/javascript" src="js/etherwallet-master.js"></script>
<link rel="apple-touch-icon" sizes="180x180" href="images/fav/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="images/fav/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="images/fav/favicon-16x16.png">
<link rel="manifest" href="images/fav/manifest.json">
<link rel="mask-icon" href="images/fav/safari-pinned-tab.svg" color="#2f99b0">
<link rel="shortcut icon" href="images/fav/favicon.ico">
<meta name="apple-mobile-web-app-title" content="MyUrbitWallet &middot; Your Key to Ethereum">
<meta name="application-name" content="MyUrbitWallet">
<meta name="msapplication-config" content="images/fav/browserconfig.xml">
<meta name="theme-color" content="#1d6986">
<meta name="google-site-verification" content="IpChQ00NYUQuNs_7Xs6xlnSdzalOlTUYbBsr8f7OpvM" />
<meta property="og:url" content="https://www.myetherwallet.com" />
<meta property="og:title" content="MyUrbitWallet.com  &middot; Your Key to Ethereum" />
<meta property="og:image" content="/images/myetherwallet-logo-banner.png" />
<meta property="og:image" content="/images/myetherwallet-logo.png" />
<meta property="og:image" content="/images/myetherwallet-logo-square.png" />
<meta property="og:image" content="/images/myetherwallet-banner-fun.jpg" />
<meta property="og:description" content="MyUrbitWallet.com is a free, open-source, client-side interface for generating Ethereum wallets &amp; interacting with the blockchain easily &amp; securely. Double-check the URL ( .com ) before unlocking your wallet." />
<script type='application/ld+json'>{"@context":"http://schema.org","@type":"Organization","@id":"#organization","url":"https://www.myetherwallet.com/","name":"MyUrbitWallet",
"logo":"https://myetherwallet.com/images/myetherwallet-logo-banner.png","description": "MyEtherWallet.com is a free, open-source, client-side interface for generating Ethereum wallets &amp; more. Interact with the Ethereum blockchain easily &amp; securely. Double-check the URL ( .com ) before unlocking your wallet.","sameAs":["https://www.myetherwallet.com/","https://chrome.google.com/webstore/detail/myetherwallet-cx/nlbmnnijcnlegkjjpcfjclmcfggfefdm","https://www.facebook.com/MyEtherWallet/","https://twitter.com/myetherwallet","https://medium.com/@myetherwallet_96408","https://myetherwallet.groovehq.com/help_center","https://github.com/kvhnuke/etherwallet","https://github.com/MyEtherWallet","https://kvhnuke.github.io/etherwallet/","https://github.com/kvhnuke/etherwallet/releases/latest","https://github.com/409H/EtherAddressLookup","https://myetherwallet.slack.com/","https://myetherwallet.herokuapp.com/","https://www.reddit.com/r/MyEtherWallet/","https://www.reddit.com/user/insomniasexx/","https://www.reddit.com/user/kvhnuke/","https://www.reddit.com/user/myetherwallet"]}</script>
</head>
<body>
<header class="{{curNode.name}} {{curNode.service}} {{curNode.service}} nav-index-{{gService.currentTab}}" aria-label="header" ng-controller='tabsCtrl' >

<div class="container">
  <div class="row">
    <div class="path text-600 col-md-10">
      <span ng-show="getPath() == '/mode/type'">
        My Urbit Wallet
      </span>
      <span ng-show="getPath() == '/' || getPath() == '/state'">
        <a href="mode/type">Wallet</a> / 
        <span class="mode-label" ng-init="online = true">
          <div ng-class="online ? 'on green-hl mode-indicator' : 'off red-hl mode-indicator'">
          </div>
        <a href="#">{{"  "}}{{ online ? curNode.name : "Offline"}}</a>
        </span>
        / State
      </span>
      <span ng-show="isTransaction(getPath())">
        <a href="mode/type">Wallet</a> / 
        <span class="mode-label" ng-init="online = true">
          <div ng-class="online ? 'on green-hl mode-indicator' : 'off red-hl mode-indicator'">
          </div>
        <a href="#">{{"  "}}{{ online ? curNode.name : "Offline"}}</a>
        </span>
         / <a href="state">State</a> / {{ isTransaction(getPath()) }}
      </span>
    </div>
    <!-- dummy indicator, link to urbtiCtrl -->
  </div>
</div>

<!--
<section class="bg-gradient header-branding">
  <section class="container">
    <a class="brand" href="/" aria-label="Go to homepage">
      My Urbit Wallet
    </a>
    <div class="tagline">

    <span>3.10.3.9</span>

    <span class="dropdown dropdown-gas" ng-cloak>
      <a tabindex="0" aria-haspopup="true" aria-label="adjust gas price" class="dropdown-toggle  btn btn-white" ng-click="dropdownGasPrice = !dropdownGasPrice">
        <span translate="OFFLINE_Step2_Label_3">Gas Price</span>: {{gas.value}} Gwei
        <i class="caret"></i>
      </a>
      <ul class="dropdown-menu" ng-show="dropdownGasPrice">
        <div class="header--gas">
          <span translate="OFFLINE_Step2_Label_3">Gas Price</span>: {{gas.value}} Gwei
          <input type="range" ng-model="gas.value" min="{{gas.min}}" max="{{gas.max}}" steps="1" ng-change="gasChanged()"/>
          <p class="small col-xs-4 text-left">Not So Fast</p>
          <p class="small col-xs-4 text-center">Fast</p>
          <p class="small col-xs-4 text-right">Fast AF</p>
          <p class="small" style="white-space:normal;font-weight:300;margin: 2rem 0 0;" translate="GAS_PRICE_Desc"></p>
          <a class="small" translate="x_ReadMore" href="https://myetherwallet.groovehq.com/knowledge_base/topics/what-is-gas" target="_blank" rel="noopener"></a>
        </div>
      </ul>
    </span>
-->

    <!-- Warning: The separators you see on the frontend are in styles/etherwallet-custom.less. If you add / change a node, you have to adjust these. Ping tayvano if you''re not a CSS wizard -->
<!--
    <span class="dropdown dropdown-node" ng-cloak>
      <a tabindex="0" aria-haspopup="true" aria-label="change node. current node {{curNode.name}} node by {{curNode.service}}" class="dropdown-toggle  btn btn-white" ng-click="dropdownNode = !dropdownNode">
        Network: {{curNode.name}} <small>({{curNode.service}})</small>
        <i class="caret"></i>
      </a>
      <ul class="dropdown-menu" ng-show="dropdownNode">
        <li ng-repeat="(key, value) in nodeList"><a ng-class="{true:'active'}[curNode == key]" ng-click="changeNode(key)">
          {{value.name}}
          <small> ({{value.service}}) </small>
          <img ng-show="value.service=='Custom'" src="images/icon-remove.svg" class="node-remove" title="Remove Custom Node" ng-click="removeNodeFromLocal(value.name)"/>
        </a></li>
        <li><a ng-click="customNodeModal.open(); dropdownNode = !dropdownNode;"> Add Custom Node </a></li>
      </ul>
    </span>

    </div>
  </section>
</section>
-->

<!--
@@include( './header-node-modal.tpl', { "site": "mew" } )
-->

</header>
