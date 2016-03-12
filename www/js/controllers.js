angular.module('inform.controllers', [])

.controller('MenuCtrl', function($scope, $rootScope, $timeout, $ionicSideMenuDelegate, User, $state, $cordovaSplashscreen) {
    console.log('menu controller');

    $scope.isOpenLeft = function(){
        return $ionicSideMenuDelegate.isOpenLeft();
    }

    $scope.role = $rootScope.user.get('role');

    $scope.logout = function(){
        User
            .logOut()
            .finally(function(){
                $rootScope.user = null;
                $state.go('auth');
            });
    };

    $scope.switch = function(){
        $cordovaSplashscreen.show();

        switch($rootScope.role){
        case 'manager': $rootScope.role = 'player'; break;
        case 'player': $rootScope.role = 'manager'; break;
        }

        console.log($rootScope.role, 'switched to');

        $timeout(function(){
            $state.go('app.home');
            $cordovaSplashscreen.hide();
        }, 2000);
    }
});
