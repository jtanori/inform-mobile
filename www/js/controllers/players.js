angular.module('inform.controllers')

.controller('PlayersCtrl', function($rootScope, $scope, $state, $timeout, User, $ionicLoading, $ionicHistory){
    console.log($rootScope.user, 'user check');
    if(_.isEmpty($rootScope.user)){
        $state.go('auth');
        return;
    }

    console.log('settings ctrl');
});
