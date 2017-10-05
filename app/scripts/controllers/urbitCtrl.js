'use strict';
var urbitCtrl = function($scope, $sce, walletService) {
    $scope.ajaxReq = ajaxReq;
    walletService.wallet = null;
    $scope.visibility = "interactView";
    $scope.sendContractModal = new Modal(document.getElementById('sendContract'));
    $scope.showReadWrite = false;
    $scope.Validator = Validator;
    $scope.oneSpark = 1000000000000000000;
    $scope.tx = {
        gasLimit: '',
        data: '',
        to: '',
        unit: "ether",
        value: 0,
        nonce: null,
        gasPrice: null
    }
    $scope.contract = {
        address: globalFuncs.urlGet('address') != null && $scope.Validator.isValidAddress(globalFuncs.urlGet('address')) ? globalFuncs.urlGet('address') : '',
        abi: '',
        functions: [],
        selectedFunc: null
    }
    $scope.selectedAbi = ajaxReq.abiList[0];
    $scope.showRaw = false;
    $scope.$watch(function() {
        if (walletService.wallet == null) return null;
        return walletService.wallet.getAddressString();
    }, function() {
        if (walletService.wallet == null) return;
        $scope.wallet = walletService.wallet;
        $scope.wd = true;
        $scope.tx.nonce = 0;

    });
    $scope.$watch('visibility', function(newValue, oldValue) {
        $scope.tx = {
            gasLimit: '',
            data: '',
            to: '',
            unit: "ether",
            value: 0,
            nonce: null,
            gasPrice: null
        }

    });
    $scope.$watch('contract.address', function(newValue, oldValue) {
        if ($scope.Validator.isValidAddress($scope.contract.address)) {
            for (var i in ajaxReq.abiList) {
                if (ajaxReq.abiList[i].address.toLowerCase() == $scope.contract.address.toLowerCase()) {
                    $scope.contract.abi = ajaxReq.abiList[i].abi;
                    break;
                }
            }
        }
    });
    $scope.toWei = function(ether) {
      return etherUnits.toWei(ether, "ether");
    }
    $scope.toEther = function(wei) {
      return etherUnits.toEther(wei, "wei");
    }
    $scope.selectExistingAbi = function(index) {
        $scope.selectedAbi = ajaxReq.abiList[index];
        $scope.contract.address = $scope.selectedAbi.address;
        $scope.addressDrtv.ensAddressField = $scope.selectedAbi.address;
        $scope.addressDrtv.showDerivedAddress = false;
        $scope.dropdownExistingContracts = false;
        $scope.contract.selectedFunc=null
        $scope.dropdownContracts = false;

        if ($scope.initContractTimer) clearTimeout($scope.initContractTimer);
        $scope.initContractTimer = setTimeout(function() {
            $scope.initContract();
        }, 50);
    }
    $scope.generateTx = function() {
        try {
            if ($scope.wallet == null)
            { throw globalFuncs.errorMsgs[3]; }
            else if (!ethFuncs.validateHexString($scope.tx.data))
            { throw globalFuncs.errorMsgs[9]; }
            else if (!globalFuncs.isNumeric($scope.tx.gasLimit) || parseFloat($scope.tx.gasLimit) <= 0)
            { throw globalFuncs.errorMsgs[8]; }
            $scope.tx.data = ethFuncs.sanitizeHex($scope.tx.data);
            ajaxReq.getTransactionData($scope.wallet.getAddressString(), function(data) {
                if (data.error) $scope.notifier.danger(data.msg);
                data = data.data;
                $scope.tx.to = $scope.tx.to == '' ? '0xCONTRACT' : $scope.tx.to;
                $scope.tx.contractAddr = $scope.tx.to == '0xCONTRACT' ? ethFuncs.getDeteministicContractAddress($scope.wallet.getAddressString(), data.nonce) : '';
                var txData = uiFuncs.getTxData($scope);
                uiFuncs.generateTx(txData, function(rawTx) {
                    if (!rawTx.isError) {
                        $scope.rawTx = rawTx.rawTx;
                        $scope.signedTx = rawTx.signedTx;
                        $scope.showRaw = true;
                    } else {
                        $scope.showRaw = false;
                        $scope.notifier.danger(rawTx.error);
                        console.error(rawTx.error);
                    }
                    if (!$scope.$$phase) $scope.$apply();
                });
            });
        } catch (e) {
            $scope.notifier.danger(e);
        }
    }
    $scope.sendTx = function() {
        $scope.sendContractModal.close();
        uiFuncs.sendTx($scope.signedTx, function(resp) {
            if (!resp.isError) {
                var bExStr = $scope.ajaxReq.type != nodes.nodeTypes.Custom ? "<a href='" + $scope.ajaxReq.blockExplorerTX.replace("[[txHash]]", resp.data) + "' target='_blank' rel='noopener'> View your transaction </a>" : '';
                var contractAddr = $scope.tx.contractAddr != '' ? " & Contract Address <a href='" + ajaxReq.blockExplorerAddr.replace('[[address]]', $scope.tx.contractAddr) + "' target='_blank' rel='noopener'>" + $scope.tx.contractAddr + "</a>" : '';
                $scope.notifier.success(globalFuncs.successMsgs[2] + "<br />" + resp.data + "<br />" + bExStr + contractAddr);
            } else {
                $scope.notifier.danger(resp.error);
            }
        });
    }
    $scope.setVisibility = function(str) {
        $scope.visibility = str;
    }
    $scope.selectFunc = function(index) {
        $scope.contract.selectedFunc = { name: $scope.contract.functions[index].name, index: index };
        if (!$scope.contract.functions[index].inputs.length) {
            $scope.readFromContract();
            $scope.showRead = false;
        } else $scope.showRead = true;
        $scope.dropdownContracts = !$scope.dropdownContracts;
    }
    $scope.getTxData = function() {
        var curFunc = $scope.contract.functions[$scope.contract.selectedFunc.index];
        var fullFuncName = ethUtil.solidityUtils.transformToFullName(curFunc);
        var funcSig = ethFuncs.getFunctionSignature(fullFuncName);
        var typeName = ethUtil.solidityUtils.extractTypeName(fullFuncName);
        var types = typeName.split(',');
        types = types[0] == "" ? [] : types;
        var values = [];
        for (var i in curFunc.inputs) {
            if (curFunc.inputs[i].value) {
                if (curFunc.inputs[i].type.indexOf('[') !== -1 && curFunc.inputs[i].type.indexOf(']') !== -1) values.push(curFunc.inputs[i].value.split(','));
                else values.push(curFunc.inputs[i].value);
            } else values.push('');
        }
        return '0x' + funcSig + ethUtil.solidityCoder.encodeParams(types, values);
    }
    $scope.readFromContract = function() {
        ajaxReq.getEthCall({ to: $scope.contract.address, data: $scope.getTxData() }, function(data) {
            if (!data.error) {
                var curFunc = $scope.contract.functions[$scope.contract.selectedFunc.index];
                var outTypes = curFunc.outputs.map(function(i) {
                    return i.type;
                });
                var decoded = ethUtil.solidityCoder.decodeParams(outTypes, data.data.replace('0x', ''));
                for (var i in decoded) {
                    if (decoded[i] instanceof BigNumber) curFunc.outputs[i].value = decoded[i].toFixed(0);
                    else curFunc.outputs[i].value = decoded[i];
                }
            } else throw data.msg;

        });
    }
    $scope.initContract = function() {
        try {
            if (!$scope.Validator.isValidAddress($scope.contract.address)) throw globalFuncs.errorMsgs[5];
            else if (!$scope.Validator.isJSON($scope.contract.abi)) throw globalFuncs.errorMsgs[26];
            $scope.contract.functions = [];
            var tAbi = JSON.parse($scope.contract.abi);
            for (var i in tAbi)
                if (tAbi[i].type == "function") {
                    tAbi[i].inputs.map(function(i) { i.value = ''; });
                    $scope.contract.functions.push(tAbi[i]);
                }
            $scope.showReadWrite = true;

        } catch (e) {
            $scope.notifier.danger(e);
        }
    }
    $scope.generateContractTx = function() {
        if (!$scope.wd) {
            $scope.notifier.danger(globalFuncs.errorMsgs[3]);
            return;
        }
        $scope.tx.data = $scope.getTxData();
        $scope.tx.to = $scope.contract.address;
        $scope.sendContractModal.open();
    }
    //
    $scope.buildTransactionData = function(func, input) {
        var funcSig = ethFuncs.getFunctionSignature(func);
        var typeName = ethUtil.solidityUtils.extractTypeName(func);
        var types = typeName.split(',');
        types = types[0] == "" ? [] : types;
        return '0x' + funcSig + ethUtil.solidityCoder.encodeParams(types, input);
    }
    //NOTE value is expected in wei
    $scope.doTransaction = function(address, func, input, value) {
      if ($scope.wallet == null) {
        console.error("no wallet");
        return;
      }
      var data = $scope.buildTransactionData(func, input);
      $scope.tx.data = data;
      $scope.tx.value = value || 0;
      $scope.tx.unit = "wei";
      var estObj = {
        from: $scope.wallet.getAddressString(),
        value: ethFuncs.sanitizeHex(ethFuncs.decimalToHex($scope.tx.value)),
        data: ethFuncs.sanitizeHex(data),
      }
      estObj.to = address;
      ethFuncs.estimateGas(estObj, function(data) {
        if (data.error) {
          console.log("on contract " + address);
          console.log("calling " + func + " " + input);
          console.log("sending " + value + " wei");
          // Proper input validation should prevent this.
          console.error("Gas estimation failed. Probably invalid transaction. Are your parameters correct?");
        } else {
          // to not fall victim to inaccurate estimates, allow slightly more gas to be used.
          //TODO 1.8 is a bit much though. consult experts on why this can be so
          //     unpredictable, and how to fix it.
          $scope.tx.gasLimit = Math.round(data.data * 1.8);
          try {
            if ($scope.wallet == null)
            { throw globalFuncs.errorMsgs[3]; }
            else if (!ethFuncs.validateHexString($scope.tx.data))
            { throw globalFuncs.errorMsgs[9]; }
            else if (!globalFuncs.isNumeric($scope.tx.gasLimit) || parseFloat($scope.tx.gasLimit) <= 0)
            { throw globalFuncs.errorMsgs[8]; }
            $scope.tx.data = ethFuncs.sanitizeHex($scope.tx.data);
            ajaxReq.getTransactionData($scope.wallet.getAddressString(), function(data) {
              if (data.error) $scope.notifier.danger(data.msg);
              data = data.data;
              $scope.tx.to = address;
              $scope.tx.contractAddr = $scope.tx.to;
              $scope.showRaw = false;
              $scope.sendContractModal.open();
            });
          } catch (e) {
            $scope.notifier.danger(e);
          }
        }
      });
    }
    $scope.readContractData = function(address, func, input, outTypes, callback) {
        $scope.contract.address = address;
        var call = $scope.buildTransactionData(func, input);
        ajaxReq.getEthCall({ to: $scope.contract.address, data: call }, function(data) {
          if (!data.error) {
            var decoded = ethUtil.solidityCoder.decodeParams(outTypes, data.data.replace('0x', ''));
            for (var i in decoded) {
              if (decoded[i] instanceof BigNumber) decoded[i] = decoded[i].toFixed(0);
            }
            callback(decoded);
          } else throw data.msg;
        });
    }
    $scope.loadAddresses = function() {
      $scope.contracts = {};
      $scope.contracts.ships = "0xe0834579269eac6beca2882a6a21f6fb0b1d7196";
      $scope.contracts.votes = "0x0654b24a5da81f6ed1ac568e802a9d6b21483561";
      $scope.contracts.spark = "0x56db68f29203ff44a803faa2404a44ecbb7a7480";
      $scope.getShipsOwner(function(data) {
        $scope.contracts.constitution = data[0];
      });
    }
    //
    // VALIDATE: validate input data
    //
    $scope.validateShip = function(ship, next) {
      if (ship < 0 || ship > 4294967295)
        return $scope.notifier.danger("Ship " + ship + " not a galaxy, star or planet.");
      return next();
    }
    $scope.validateParent = function(ship, next) {
      if (ship < 0 || ship > 65535)
        return $scope.notifier.danger("Ship " + ship + " not a galaxy or star.");
      return next();
    }
    $scope.validateChild = function(ship, next) {
      if (ship < 256 || ship > 4294967295)
        return $scope.notifier.danger("Ship " + ship + " not a star or planet.");
      return next();
    }
    $scope.validateGalaxy = function(galaxy, next) {
      if (galaxy < 0 || galaxy > 255)
        return $scope.notifier.danger("Ship " + galaxy + " not a galaxy.");
      return next();
    }
    $scope.validateStar = function(star, next) {
      if (star < 256 || star > 65535)
        return $scope.notifier.danger("Ship " + star + " not a star.");
      return next();
    }
    $scope.validateAddress = function(address, next) {
      if (!ethFuncs.validateEtherAddress(address))
        return $scope.notifier.danger(address + " is not a valid Ethereum address.");
      return next();
    }
    $scope.validateState = function(state, next) {
      if (state < 0 || state > 3)
        return $scope.notifier.danger("Invalid state: " + state);
      return next();
    }
    $scope.validateTimestamp = function(timestamp, next) {
      if (timestamp < 0 || timestamp > 4200000000)
        return $scope.notifier.danger("Weird timestamp: " + timestamp);
      return next();
    }
    $scope.validateBytes32 = function(bytes, next) {
      if (bytes.length > 32)
        return $scope.notifier.danger("Input too long: " + bytes);
      return next();
    }
    //
    // GET: read contract data, pass the result to callback
    //
    $scope.getShipsOwner = function(callback) {
      $scope.readContractData($scope.contracts.ships,
        "owner()",
        [],
        ["address"],
        callback
      );
    }
    $scope.getConstitutionOwner = function(callback) {
      $scope.readContractData($scope.contracts.constitution,
        "owner()",
        [],
        ["address"],
        callback
      );
    }
    $scope.getVotesAddress = function(callback) {
      $scope.readContractData($scope.contracts.constitution,
        "votes()",
        [],
        ["address"],
        callback
      );
    }
    $scope.getSparkAddress = function(callback) {
      $scope.readContractData($scope.contracts.constitution,
        "USP()",
        [],
        ["address"],
        callback
      );
    }
    $scope.getShipData = function(ship, callback) {
      $scope.readContractData($scope.contracts.ships,
        "getShipData(uint32)",
        [ship],
        [ "address",  // pilot
          "uint8",    // state
          "uint64",   // locked
          "bytes32",  // key
          "uint256",  // revision
          "uint16",   // parent
          "uint32"    // escape
        ],
        callback
      );
    }
    $scope.getOwnedShips = function(callback) {
      $scope.readContractData($scope.contracts.ships,
        "getOwnedShips()",
        [],
        ["uint32[]"],
        callback
      );
    }
    $scope.getHasPilot = function(ship, callback) {
      $scope.readContractData($scope.contracts.ships,
        "hasPilot(uint32)",
        [ship],
        ["bool"],
        callback
      );
    }
    $scope.getIsPilot = function(ship, address, callback) {
      $scope.readContractData($scope.contracts.ships,
        "isPilot(uint32,address)",
        [ship, address],
        ["bool"],
        callback
      );
    }
    $scope.getIsState = function(ship, state, callback) {
      $scope.readContractData($scope.contracts.ships,
        "isState(uint32,uint8)",
        [ship, state],
        ["bool"],
        callback
      );
    }
    $scope.getLocked = function(ship, callback) {
      $scope.readContractData($scope.contracts.ships,
        "getLocked(uint32)",
        [ship],
        ["uint64"],
        callback
      );
    }
    $scope.getParent = function(ship, callback) {
      $scope.readContractData($scope.contracts.ships,
        "getParent(uint32)",
        [ship],
        ["uint16"],
        callback
      );
    }
    $scope.getIsEscape = function(ship, escape, callback) {
      $scope.readContractData($scope.contracts.ships,
        "isEscape(uint32,uint16)",
        [ship, escape],
        ["bool"],
        callback
      );
    }
    $scope.getKey = function(ship, callback) {
      $scope.readContractData($scope.contracts.ships,
        "getKey(uint32)",
        [ship],
        ["bytes32"],
        callback
      );
    }
    $scope.getIsLauncher = function(ship, address, callback) {
      $scope.readContractData($scope.contracts.ships,
        "isLauncher(uint16,address)",
        [ship, address],
        ["bool"],
        callback
      );
    }
    $scope.getSparkBalance = function(callback) {
      $scope.readContractData($scope.contracts.spark,
        "balanceOf(address)",
        [$scope.wallet.getAddressString()],
        ["uint256"],
        callback
      );
    }
    $scope.getAllowance = function(callback) {
      // specifically: allowance of the constitution
      $scope.readContractData($scope.contracts.spark,
        "allowance(address,address)",
        [ $scope.wallet.getAddressString(),
          $scope.contracts.constitution
        ],
        ["uint256"],
        callback
      );
    }
    $scope.getConcreteVote = function(galaxy, address, callback) {
      $scope.readContractData($scope.contracts.votes,
        "getVote(uint8,address)",
        [galaxy, address],
        ["bool"],
        callback
      );
    }
    $scope.getIsAbstractMajority = function(proposal, callback) {
      $scope.readContractData($scope.contracts.votes,
        "abstractMajorityMap(bytes32)",
        [proposal],
        ["bool"],
        callback
      );
    }
    $scope.getAbstractVote = function(galaxy, proposal, callback) {
      $scope.readContractData($scope.contracts.votes,
        "getVote(uint8,bytes32)",
        [galaxy, proposal],
        ["bool"],
        callback
      );
    }
    $scope.getSalePrice = function(address, callback) {
      $scope.readContractData(address,
        "price()",
        [],
        ["uint256"],
        callback
      );
    }
    $scope.getSalePlanets = function(address, callback) {
      $scope.readContractData(address,
        "getAvailable()",
        [],
        ["uint32[]"],
        callback
      );
    }
    $scope.getAuctionWhitelisted = function(address, callback) {
      $scope.readContractData(address,
        "whitelist(address)",
        [$scope.wallet.getAddressString()],
        ["bool"],
        callback
      );
    }
    $scope.getAuctionDeposit = function(address, callback) {
      $scope.readContractData(address,
        "deposits(address)",
        [$scope.wallet.getAddressString()],
        ["uint256"],
        callback
      );
    }
    $scope.getAuctionEndTime = function(address, callback) {
      $scope.readContractData(address,
        "endTimestamp()",
        [],
        ["uint256"],
        callback
      );
    }
    $scope.getAuctionStrikePrice = function(address, callback) {
      $scope.readContractData(address,
        "strikePrice()",
        [],
        ["uint256"],
        callback
      );
    }
    //
    // READ: fill fields with requested data
    //
    $scope.readShipData = function() {
      var ship = document.getElementById("getShipData_ship").value;
      $scope.validateShip(ship, function() {
        $scope.getShipData(ship, put);
      });
      function put(data) {
        var output = [
          document.getElementById("shipData_pilot"),
          document.getElementById("shipData_state"),
          document.getElementById("shipData_locked"),
          document.getElementById("shipData_key"),
          document.getElementById("shipData_revision"),
          document.getElementById("shipData_parent"),
          document.getElementById("shipData_escape")
        ];
        for (var i in data) {
          output[i].value = data[i];
        }
      }
    }
    $scope.readOwnedShips = function() {
      $scope.getOwnedShips(function(data) {
        var res = "";
        for (var i in data[0]) {
          res = res + data[0][i] + "\n";
        }
        document.getElementById("ownedShips").value = res;
      });
    }
    $scope.readHasPilot = function() {
      var ship = document.getElementById("getHasPilot_ship").value;
      $scope.validateShip(ship, function() {
        $scope.getHasPilot(ship, put);
      });
      function put(data) {
        document.getElementById("hasPilot").checked = data[0];
      }
    }
    $scope.readIsPilot = function() {
      var ship = document.getElementById("getIsPilot_ship").value;
      var addr = document.getElementById("getIsPilot_address").value;
      $scope.validateShip(ship, function() {
        $scope.validateAddress(addr, function() {
          $scope.getIsPilot(ship, addr, put);
        });
      });
      function put(data) {
        document.getElementById("isPilot").checked = data[0];
      }
    }
    $scope.readIsState = function() {
      var ship = document.getElementById("getIsState_ship").value;
      var stat = document.getElementById("getIsState_state").value;
      $scope.validateShip(ship, function() {
        $scope.validateState(stat, function() {
          $scope.getIsState(ship, stat, put);
        });
      });
      function put(data) {
        document.getElementById("isState").checked = data[0];
      }
    }
    $scope.readLocked = function() {
      var ship = document.getElementById("getLocked_ship").value;
      $scope.validateShip(ship, function() {
        $scope.getLocked(ship, put);
      });
      function put(data) {
        document.getElementById("locked").value = data[0];
      }
    }
    $scope.readParent = function() {
      var ship = document.getElementById("getParent_ship").value;
      $scope.validateChild(ship, function() {
        $scope.getParent(ship, put);
      });
      function put(data) {
        document.getElementById("parent").value = data[0];
      }
    }
    $scope.readIsEscape = function() {
      var ship = document.getElementById("getIsEscape_ship").value;
      var escp = document.getElementById("getIsEscape_escape").value;
      $scope.validateChild(ship, function() {
        $scope.validateParent(escp, function () {
          $scope.getIsEscape(ship, escp, put);
        });
      });
      function put(data) {
        document.getElementById("isEscape").checked = data[0];
      }
    }
    $scope.readKey = function() {
      var ship = document.getElementById("getKey_ship").value;
      $scope.validateShip(ship, function() {
        $scope.getKey(ship, put);
      });
      function put(data) {
        document.getElementById("key").value = data[0];
      }
    }
    $scope.readIsLauncher = function() {
      var ship = document.getElementById("getIsLauncher_ship").value;
      var addr = document.getElementById("getIsLauncher_address").value;
      $scope.validateParent(ship, function() {
        $scope.validateAddress(addr, function () {
          $scope.getIsLauncher(ship, addr, put);
        });
      });
      function put(data) {
        document.getElementById("isLauncher").checked = data[0];
      }
    }
    $scope.readBalance = function() {
      $scope.getSparkBalance(function(data) {
        document.getElementById("balance").value = data[0] / $scope.oneSpark;
      });
    }
    $scope.readAllowance = function() {
      $scope.getAllowance(function(data) {
        document.getElementById("allowance").value = data[0] / $scope.oneSpark;
      })
    }
    $scope.readSaleData = function() {
      var addr = document.getElementById("sale_address").value;
      $scope.validateAddress(addr, function() {
        $scope.getSalePrice(addr, putPrice);
        $scope.getSalePlanets(addr, putPlanets);
      });
      function putPrice(data) {
        document.getElementById("sale_price").value = $scope.toEther(data[0]);
      }
      function putPlanets(data) {
        var res = "";
        for (var i in data[0]) {
          res = res + data[0][i] + "\n";
        }
        document.getElementById("sale_planets").value = res;
      }
    }
    $scope.readAuctionData = function() {
      var addr = document.getElementById("auction_address").value;
      $scope.validateAddress(addr, function() {
        $scope.getAuctionWhitelisted(addr, putWhitelisted);
        $scope.getAuctionEndTime(addr, putTime);
        $scope.getAuctionDeposit(addr, putDeposit);
      });
      function putWhitelisted(data) {
        document.getElementById("auction_whitelisted").checked = data[0];
      }
      function putTime(data) {
        document.getElementById("auction_time").value = data[0];
      }
      function putDeposit(data) {
        var eth = $scope.toEther(data[0]);
        document.getElementById("auction_deposit").value = eth;
      }
    }
    //
    // CHECK: verify if conditions for a transaction are met
    //
    $scope.checkOwnership = function(ship, next) {
      $scope.getIsPilot(ship, $scope.wallet.getAddressString(), function(data) {
        if (data[0]) return next();
        $scope.notifier.danger("Not your ship. " + ship);
      });
    }
    $scope.checkState = function(ship, state, next) {
      $scope.getIsState(ship, state, function(data) {
        if (data[0]) return next();
        $scope.notifier.danger("Ship is not in state " + state);
      });
    }
    $scope.checkEscape = function(ship, parent, next) {
      $scope.getIsEscape(ship, parent, function(data) {
        if (data[0]) return next();
        $scope.notifier.danger("Escape doesn't match.");
      });
    }
    //NOTE expects amount in wei
    $scope.checkBalance = function(amount, next) {
      $scope.wallet.setBalance(function() {
        if (amount <= $scope.toWei($scope.wallet.getBalance()))
          return next();
        $scope.notifier.danger("Not enough ETH in wallet.");
      });
    }
    $scope.checkSale = function(ship, address, next) {
      //TODO move to utility function maybe
      var parent = ship % 65536;
      if (ship < 65536) parent = ship % 256;
      $scope.getIsLauncher(parent, address, checkLauncher);
      function checkLauncher(data) {
        if (data[0]) return $scope.getSalePrice(address, checkPrice);
        return $scope.notifier.danger("Contract can't launch ships.");
      }
      function checkPrice(data) {
        $scope.checkBalance(data[0], function() { next(data[0]); })
      }
    }
    //
    // DO: do transactions that modify the blockchain
    //
    $scope.doSetAllowance = function() {
      var amount = document.getElementById("allowance_amount").value;
      if (amount < 0) return $scope.notifier.danger("Can't set negative allowance.");
      amount = amount * $scope.oneSpark;
      if ($scope.offline) return transact();
      $scope.getAllowance(function(data) {
        if (amount == 0 || data[0] == 0) return transact();
        $scope.notifier.danger("To change allowance, set to 0 first.");
        //TODO we can use increaseApproval and decreaseApproval
      });
      function transact() {
        $scope.doTransaction($scope.contracts.spark,
          "approve(address,uint256)",
          [$scope.contracts.constitution, amount]
        );
      }
    }
    $scope.doCreateGalaxy = function() {
      var galaxy = document.getElementById("createGalaxy_galaxy").value;
      var address = document.getElementById("createGalaxy_owner").value;
      var locktime = document.getElementById("createGalaxy_locktime").value;
      $scope.validateGalaxy(galaxy, function() {
        $scope.validateAddress(address, function() {
          $scope.validateTimestamp(locktime, function() {
            if ($scope.offline) return transact();
            $scope.getConstitutionOwner(checkPermission);
          });
        });
      });
      function checkPermission(data) {
        if (data[0] != $scope.wallet.getAddressString())
          return $scope.notifier.danger("Insufficient permissions.");
        $scope.getHasPilot(galaxy, checkAvailable);
      }
      function checkAvailable(data) {
        if (data[0])
          return $scope.notifier.danger("Galaxy already owned.");
        transact();
      }
      function transact() {
        $scope.doTransaction($scope.contracts.constitution,
          "createGalaxy(uint8,address,uint64)",
          [galaxy, address, locktime]
        );
      }
    }
    $scope.doClaimStar = function() {
      var star = document.getElementById("claim_star").value;
      $scope.validateStar(star, function() {
        if ($scope.offline) return transact();
        $scope.getSparkBalance(checkBalance);
      });
      function checkBalance(data) {
        if (data[0] < $scope.oneSpark)
          return $scope.notifier.danger("Insufficient Sparks.");
        //TODO state enum (liquid)
        $scope.checkState(star, 1, function() {
          $scope.getAllowance(transact);
        });
      }
      function transact(data) {
        if (data[0] < $scope.oneSpark) {
          return $scope.notifier.danger("Insufficient allowance.");
        }
        $scope.doTransaction($scope.contracts.constitution,
          "claimStar(uint16)",
          [star]
        );
      }
    }
    $scope.doLiquidateStar = function() {
      var star = document.getElementById("liquidate_star").value;
      var parent = star % 256;
      $scope.validateStar(star, function() {
        if ($scope.offline) return transact();
        $scope.checkOwnership(parent, function() {
          //TODO state enum (living)
          $scope.checkState(parent, 3, function() {
            //TODO state enum (latent)
            $scope.checkState(star, 0, transact);
          });
        });
      });
      function transact() {
        $scope.doTransaction($scope.contracts.constitution,
          "liquidateStar(uint16)",
          [star]
        );
      }
    }
    $scope.doLaunch = function() {
      var ship = document.getElementById("launch_ship").value;
      var addr = document.getElementById("launch_address").value;
      var parent = ship % 256;
      if (ship > 65535) parent = ship % 65536;
      $scope.validateShip(ship, function() {
        $scope.validateAddress(addr, function() {
          if ($scope.offline) return transact();
          // ship needs to be latent
          //TODO state enum (latent)
          $scope.checkState(ship, 0, checkParent);
        });
      });
      // ship needs to be galaxy, or its parent needs to be living
      function checkParent() {
        if (ship < 256) return checkRights();
        //TODO state enum (living)
        $scope.checkState(parent, 3, checkRights);
      }
      // user needs to be pilot of parent or launcher of parent
      function checkRights() {
        $scope.getIsLauncher(parent, $scope.wallet.getAddressString(),
        function(data) {
          if (data[0]) return transact();
          $scope.checkOwnership(parent, transact);
        });
      }
      function transact() {
        $scope.doTransaction($scope.contracts.constitution,
          "launch(uint32,address)",
          [ship, addr]
        );
      }
    }
    $scope.doGrantLaunchRights = function() {
      var star = document.getElementById("grantLaunch_star").value;
      var addr = document.getElementById("grantLaunch_address").value;
      $scope.validateParent(star, function() {
        $scope.validateAddress(addr, function() {
          if ($scope.offline) return transact();
          $scope.checkOwnership(star, function() {
            //TODO state enum (living)
            $scope.checkState(star, 3, transact);
          });
        });
      });
      function transact() {
        $scope.doTransaction($scope.contracts.constitution,
          "grantLaunchRights(uint16,address)",
          [star, addr]
        );
      }
    }
    $scope.doRevokeLaunchRights = function() {
      var star = document.getElementById("revokeLaunch_star").value;
      var addr = document.getElementById("revokeLaunch_address").value;
      $scope.validateParent(star, function() {
        $scope.validateAddress(addr, function() {
          if ($scope.offline) return transact();
          $scope.checkOwnership(star, transact);
        });
      });
      function transact() {
        $scope.doTransaction($scope.contracts.constitution,
          "revokeLaunchRights(uint16,address)",
          [star, addr]
        );
      }
    }
    $scope.doStart = function() {
      var ship = document.getElementById("start_ship").value;
      var key = document.getElementById("start_key").value;
      $scope.validateShip(ship, function() {
        $scope.validateBytes32(key, function() {
          if ($scope.offline) return transact();
          $scope.checkOwnership(ship, function() {
            $scope.checkState(ship, 2, function() {
              $scope.getLocked(ship, checkLocktime);
            });
          });
        });
      });
      function checkLocktime(data) {
        if (data[0] <= (Date.now() / 1000)) return transact();
        $scope.notifier.danger("Ship locked until " + data[0])
      }
      function transact() {
        $scope.doTransaction($scope.contracts.constitution,
          "start(uint32,bytes32)",
          [ship, key]
        );
      }
    }
    $scope.doTransferShip = function() {
      var ship = document.getElementById("transfer_ship").value;
      var addr = document.getElementById("transfer_address").value;
      var reset = document.getElementById("transfer_reset").checked;
      $scope.validateShip(ship, function() {
        $scope.validateAddress(addr, function() {
          if ($scope.offline) return transact();
          $scope.checkOwnership(ship, transact);
        });
      });
      function transact() {
        $scope.doTransaction($scope.contracts.constitution,
          "transferShip(uint32,address,bool)",
          [ship, addr, reset]
        );
      }
    }
    $scope.doRekey = function() {
      var ship = document.getElementById("rekey_ship").value;
      var key = document.getElementById("rekey_key").value;
      $scope.validateShip(ship, function() {
        $scope.validateBytes32(key, function() {
          if ($scope.offline) return transact();
          $scope.checkOwnership(ship, transact);
        });
      });
      function transact() {
        $scope.doTransaction($scope.contracts.constitution,
          "rekey(uint32,bytes32)",
          [ship, key]
        );
      }
    }
    $scope.doEscape = function() {
      var ship = document.getElementById("escape_ship").value;
      var parent = document.getElementById("escape_parent").value;
      $scope.validateChild(ship, function() {
        $scope.validateParent(parent, function() {
          if ($scope.offline) return transact();
          $scope.checkOwnership(ship, transact);
        });
      });
      function transact() {
        $scope.doTransaction($scope.contracts.constitution,
          "escape(uint32,uint16)",
          [ship, parent]
        );
      }
    }
    $scope.doAdopt = function() {
      var parent = document.getElementById("adopt_parent").value;
      var ship = document.getElementById("adopt_ship").value;
      $scope.validateParent(parent, function() {
        $scope.validateChild(ship, function () {
          if ($scope.offline) return transact();
          $scope.checkOwnership(ship, function() {
            $scope.checkEscape(ship, parent, transact);
          });
        });
      });
      function transact() {
        $scope.doTransaction($scope.contracts.constitution,
          "adopt(uint16,uint32)",
          [parent, ship]
        );
      }
    }
    $scope.doReject = function() {
      var parent = document.getElementById("reject_parent").value;
      var ship = document.getElementById("reject_ship").value;
      $scope.validateParent(parent, function() {
        $scope.validateChild(ship, function () {
          if ($scope.offline) return transact();
          $scope.checkOwnership(ship, function() {
            $scope.checkEscape(ship, parent, transact);
          });
        });
      });
      function transact() {
        $scope.doTransaction($scope.contracts.constitution,
          "reject(uint16,uint32)",
          [parent, ship]
        );
      }
    }
    $scope.doCastConcreteVote = function() {
      var galaxy = document.getElementById("conVote_galaxy").value;
      var addr = document.getElementById("conVote_address").value;
      var vote = document.getElementById("conVote_vote").checked;
      $scope.validateGalaxy(galaxy, function() {
        $scope.validateAddress(addr, function() {
          if ($scope.offline) return transact();
          $scope.checkOwnership(galaxy, function() {
            //TODO state enum (living)
            $scope.checkState(galaxy, 3, function() {
              $scope.getConcreteVote(galaxy, addr, checkVote);
            });
          });
        });
      });
      function checkVote(data) {
        if (data[0] != vote) return transact();
        $scope.notifier.danger("Vote already registered.");
      }
      function transact() {
        $scope.doTransaction($scope.contracts.constitution,
          "castVote(uint8,address,bool)",
          [galaxy, addr, vote]
        );
      }
    }
    $scope.doCastAbstractVote = function() {
      var galaxy = document.getElementById("absVote_galaxy").value;
      var prop = document.getElementById("absVote_proposal").value;
      var vote = document.getElementById("absVote_vote").checked;
      $scope.validateGalaxy(galaxy, function() {
        $scope.validateBytes32(prop, function() {
          if ($scope.offline) return transact();
          $scope.checkOwnership(galaxy, function() {
            //TODO state enum (living)
            $scope.checkState(galaxy, 3, function() {
              $scope.getIsAbstractMajority(prop, checkMajority);
            });
          });
        });
      });
      function checkMajority(data) {
        if (!data[0]) return $scope.getAbstractVote(galaxy, prop, checkVote);
        return $scope.notifier.danger("Proposal already has majority.");
      }
      function checkVote(data) {
        if (data[0] != vote) return transact();
        $scope.notifier.danger("Vote already registered.");
      }
      function transact() {
        $scope.doTransaction($scope.contracts.constitution,
          "castVote(uint8,bytes32,bool)",
          [galaxy, prop, vote]
        );
      }
    }
    $scope.doBuyPlanet = function() {
      var addr = document.getElementById("buy_address").value;
      var ship = document.getElementById("buy_ship").value;
      var index = document.getElementById("buy_index").value;
      $scope.validateAddress(addr, function() {
        $scope.validateChild(ship, function() {
          if ($scope.offline) return transact();
          $scope.getSalePlanets(addr, checkPlanet);
        });
      });
      function checkPlanet(data) {
        var found = false;
        for (var i in data[0]) {
          if (data[0][i] == ship) {
            found = true;
            index = i;
            break;
          }
        }
        if (!found) return $scope.notifier.danger("Planet not available.");
        $scope.checkSale(ship, addr, transact);
      }
      function transact(price) {
        $scope.doTransaction(addr,
          "buySpecific(uint256,uint32)",
          [index, ship],
          price
        );
      }
    }
    $scope.doBuyAnyPlanet = function() {
      var addr = document.getElementById("buy_address").value;
      $scope.validateAddress(addr, function() {
        if ($scope.offline) return transact();
        $scope.getSalePlanets(addr, checkAvailable);
      });
      function checkAvailable(data) {
        if (data[0].length == 0) return $scope.notifier.danger("No more planets for sale.");
        $scope.checkSale(data[0][data[0].length-1], addr, transact);
      }
      function transact(price) {
        $scope.doTransaction(addr,
          "buyAny()",
          [],
          price
        );
      }
    }
    $scope.doDepositBid = function() {
      var addr = document.getElementById("bid_address").value;
      var amount = document.getElementById("bid_amount").value;
      amount = $scope.toWei(amount);
      $scope.validateAddress(addr, function() {
        if ($scope.offline) return transact();
        $scope.checkBalance(amount, function() {
          $scope.getAuctionWhitelisted(addr, function(data) {
            if (data[0]) return transact();
            $scope.notifier.danger("Not whitelisted as participant.");
          });
        });
      });
      function transact() {
        $scope.doTransaction(addr,
          "deposit()",
          [],
          amount
        );
      }
    }
}
module.exports = urbitCtrl;
