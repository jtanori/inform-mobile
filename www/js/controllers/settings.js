angular.module('inform.controllers')

.controller('SettingsCtrl', function($rootScope, $scope, $state, $timeout, User, $ionicLoading, $ionicHistory){
    console.log($rootScope.user, 'user check');
    if(_.isEmpty($rootScope.user)){
        $state.go('auth');
        return;
    }

    console.log('settings ctrl');
});
