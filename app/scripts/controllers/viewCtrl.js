'use strict';
var viewCtrl = function($scope, globalService, $sce) {
    $scope.globalService = globalService;
    $scope.notifier = uiFuncs.notifier;
    $scope.notifier.sce = $sce;
    $scope.notifier.scope = $scope;
    $scope.$on('nodeChange', function(e, d) {
      $scope.$broadcast('nodeChanged', d);
    });
};
module.exports = viewCtrl;
