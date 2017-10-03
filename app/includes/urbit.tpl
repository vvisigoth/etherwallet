<main class="tab-pane urbit active" ng-controller='urbitCtrl' ng-cloak>

  <!-- Title -->
  <div class="block text-center">
    <h1>
      <a translate="NAV_InteractUrbit" ng-class="{'isActive': visibility=='interactView'}" ng-click="setVisibility('interactView')"> Interact with Urbit</a>
    </h1>
  </div>
  <!-- / Title -->

  <!--wallet decrypt-->
  <article class="form-group" ng-show="(true || !wd && visibility=='deployView') || (!wd && visibility=='interactView' && contract.selectedFunc && !contract.functions[contract.selectedFunc.index].constant)">
      <wallet-decrypt-drtv></wallet-decrypt-drtv>
  </article>


  <!-- read calls -->

  <article class="form-group" ng-init="loadAddresses();">

    <form name="fetchBalance">
      <button ng-click="readBalance();">get spark balance</button>
      <br/>
      <input id="balance" type="number" disabled />
    </form>
    <br/>

    <form name="fetchAllowance">
      <button ng-click="readAllowance();">get constitution's spark allowance</button>
      <br/>
      <input id="allowance" type="number" disabled />
    </form>
    <br/>

    <form name="fetchShipData">
      <input id="getShipData_ship" type="number" placeholder="ship #" />
      <button ng-click="readShipData();">get ship data</button>
      <br/>
      <input id="shipData_pilot" type="text" disabled />
      <input id="shipData_state" type="number" disabled />
      <input id="shipData_locked" type="number" disabled />
      <input id="shipData_key" type="text" disabled />
      <input id="shipData_revision" type="number" disabled />
      <input id="shipData_parent" type="number" disabled />
      <input id="shipData_escape" type="number" disabled />
    </form>
    <br/>

    <form name="fetchOwnedShips">
      <button ng-click="readOwnedShips();">get owned ships</button>
      <br/>
      <textarea id="ownedShips"></textarea>
    </form>
    <br/>

    <form name="fetchHasPilot">
      <input id="getHasPilot_ship" type="number" placeholder="ship #" />
      <button ng-click="readHasPilot();">has pilot?</button>
      <br/>
      <input id="hasPilot" type="checkbox" disabled />
    </form>
    <br/>

    <form name="fetchIsPilot">
      <input id="getIsPilot_ship" type="number" placeholder="ship #" />
      <input id="getIsPilot_address" type="text" placeholder="address" />
      <button ng-click="readIsPilot();">is pilot?</button>
      <br/>
      <input id="isPilot" type="checkbox" disabled />
    </form>
    <br/>

    <form name="fetchIsState">
      <input id="getIsState_ship" type="number" placeholder="ship #" />
      <input id="getIsState_state" type="number" placeholder="state" />
      <button ng-click="readIsState();">is state?</button>
      <br/>
      <input id="isState" type="checkbox" disabled />
    </form>
    <br/>

    <form name="fetchLocked">
      <input id="getLocked_ship" type="number" placeholder="ship #" />
      <button ng-click="readLocked();">get locktime</button>
      <br/>
      <input id="locked" type="number" disabled />
    </form>
    <br/>

    <form name="fetchParent">
      <input id="getParent_ship" type="number" placeholder="ship #" />
      <button ng-click="readParent();">get parent</button>
      <br/>
      <input id="parent" type="number" disabled />
    </form>
    <br/>

    <form name="fetchIsEscape">
      <input id="getIsEscape_ship" type="number" placeholder="ship #" />
      <input id="getIsEscape_escape" type="number" placeholder="escape #" />
      <button ng-click="readIsEscape();">is escape?</button>
      <br/>
      <input id="isEscape" type="checkbox" disabled />
    </form>
    <br/>

    <form name="fetchKey">
      <input id="getKey_ship" type="number" placeholder="ship #" />
      <button ng-click="readKey();">get key</button>
      <br/>
      <input id="key" type="text" disabled />
    </form>
    <br/>

    <form name="fetchIsLauncher">
      <input id="getIsLauncher_ship" type="number" placeholder="star #" />
      <input id="getIsLauncher_address" type="text" placeholder="contract address" />
      <button ng-click="readIsLauncher();">is launcher?</button>
      <br/>
      <input id="isLauncher" type="checkbox" disabled />
    </form>

    <hr/>

    <form name="taskSetAllowance">
      <input id="allowance_amount" type="number" placeholder="allowance amount" />
      <button ng-click="doSetAllowance();">set allowance</button>
    </form>
    <br/>

    <form name="taskCreateGalaxy">
      <input id="createGalaxy_galaxy" type="number" placeholder="galaxy #" />
      <input id="createGalaxy_owner" type="text" placeholder="owner" />
      <input id="createGalaxy_locktime" type="number" placeholder="locked until timestamp" />
      <button ng-click="doCreateGalaxy();">create galaxy</button>
    </form>
    <br/>

    <form name="taskClaimStar">
      <input id="claim_star" type="number" placeholder="star #" />
      <button ng-click="doClaimStar();">claim star</button>
    </form>
    <br/>

    <form name="taskLiquidateStar">
      <input id="liquidate_star" type="number" placeholder="star #" />
      <button ng-click="doLiquidateStar();">liquidate star</button>
    </form>
    <br/>

    <form name="taskLaunch">
      <input id="launch_ship" type="number" placeholder="ship #" />
      <input id="launch_address" type="text" placeholder="owner" />
      <button ng-click="doLaunch();">launch ship</button>
    </form>
    <br/>

    <form name="taskGrantLaunch">
      <input id="grantLaunch_star" type="number" placeholder="star #" />
      <input id="grantLaunch_address" type="text" placeholder="address" />
      <button ng-click="doGrantLaunchRights();">grant launch rights</button>
    </form>
    <br/>

    <form name="taskRevokeLaunch">
      <input id="revokeLaunch_star" type="number" placeholder="star #" />
      <input id="revokeLaunch_address" type="text" placeholder="address" />
      <button ng-click="doRevokeLaunchRights();">revoke launch rights</button>
    </form>
    <br/>

    <form name="taskStart">
      <input id="start_ship" type="number" placeholder="ship #" />
      <input id="start_key" type="text" placeholder="initial key" />
      <button ng-click="doStart();">start ship</button>
    </form>
    <br/>

    <form name="taskTransfer">
      <input id="transfer_ship" type="number" placeholder="ship #" />
      <input id="transfer_address" type="text" placeholder="to address" />
      <button ng-click="doTransferShip();">transfer ship</button>
    </form>
    <br/>

    <form name="taskRekey">
      <input id="rekey_ship" type="number" placeholder="ship #" />
      <input id="rekey_key" type="text" placeholder="new key" />
      <button ng-click="doRekey();">rekey</button>
    </form>
    <br/>

    <form name="taskEscape">
      <input id="escape_ship" type="number" placeholder="ship #" />
      <input id="escape_parent" type="number" placeholder="parent #" />
      <button ng-click="doEscape();">escape</button>
    </form>
    <br/>

    <form name="taskAdopt">
      <input id="adopt_parent" type="number" placeholder="parent #" />
      <input id="adopt_ship" type="number" placeholder="ship #" />
      <button ng-click="doAdopt();">adopt</button>
    </form>
    <br/>

    <form name="taskReject">
      <input id="reject_parent" type="number" placeholder="parent #" />
      <input id="reject_ship" type="number" placeholder="ship #" />
      <button ng-click="doReject();">reject</button>
    </form>
    <br/>

    <form name="taskConVote">
      <input id="conVote_galaxy" type="number" placeholder="galaxy #" />
      <input id="conVote_address" type="text" placeholder="new constitution address" />
      <label><input id="conVote_vote" type="checkbox" />approve</label>
      <button ng-click="doCastConcreteVote();">concrete vote</button>
    </form>
    <br/>

    <form name="taskAbsVote">
      <input id="absVote_galaxy" type="number" placeholder="galaxy #" />
      <input id="absVote_proposal" type="text" placeholder="proposal hash" />
      <label><input id="absVote_vote" type="checkbox" />approve</label>
      <button ng-click="doCastAbstractVote();">abstract vote</button>
    </form>
    <br/>

    <hr/>

    <form name="fetchSaleData">
      <input id="sale_address" type="text" placeholder="sale address" />
      <button ng-click="readSaleData();">get sale data</button>
      <br/>
      <input id="sale_price" type="number" disabled />
      <textarea id="sale_planets"></textarea>
    </form>
    <br/>

    <form name="taskBuyPlanet">
      <input id="buy_address" type="text" placeholder="sale address" />
      <button ng-click="doBuyAnyPlanet();">buy any planet</button>
      <input id="buy_ship" type="number" placeholder="planet #" />
      <button ng-click="doBuyPlanet();">buy specific planet</button>
    </form>


  </article>

  <!-- Interact Contracts -->
  <!-- somehow needed for wallet decrypt to function normally? -->
  <article ng-show="visibility=='interactView'">
    @@include( '../includes/contracts-interact-modal.tpl', { "site": "mew" } )
  </article>

</main>
