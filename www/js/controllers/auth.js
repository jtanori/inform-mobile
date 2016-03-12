angular.module('inform.controllers')

.controller('AuthCtrl', function($rootScope, $scope, $state, $timeout, User, $ionicLoading, $ionicHistory){
    if(!_.isEmpty($rootScope.user)){
        $state.go('app.home');
        return;
    }

    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
})

.controller('LoginCtrl', function($scope,
        $rootScope,
        $state,
        $stateParams,
        $ionicPlatform,
        $cordovaFacebook,
        $cordovaProgress,
        $cordovaDialogs,
        $ionicHistory,
        $localStorage,
        $cordovaSplashscreen,
        $timeout,
        User,
        AnalyticsService,
        FB_DEFAULT_PERMISSIONS,
        FB_DEFAULT_FIELDS,
        DEFAULT_SETTINGS){

    if(!_.isEmpty($rootScope.user)){
        $state.go('app.home');
        return;
    }

    $scope.userType = $stateParams.as ? $stateParams.as.toLowerCase() : null;
    $scope.as = $stateParams.as;
    $scope.user = {};
    $scope.master = {username: '', password: '', passwordConfirmation: ''};

    var _onLogin = function(){
        //Set root user
        $rootScope.user = User.current();

        if(!_.isEmpty($rootScope.user) && !_.isEmpty($rootScope.user.get('settings'))){
            $rootScope.settings = $rootScope.user.get('settings');
        }else{
            $rootScope.settings = DEFAULT_SETTINGS;
            $rootScope.user.save('settings', $rootScope.settings);
        }

        AnalyticsService.track('login', {user: $rootScope.user.id});
    }

    $scope.login = function(form) {
        if (!form.$invalid) {
            $timeout(function(){
                $cordovaProgress.showSimpleWithLabelDetail(true, 'Authenticating', 'Please give us a second');
            });

            User
                .logIn($scope.user.username, $scope.user.password)
                .then(function() {

                    _onLogin();

                    form.$setPristine();
                    form.$setUntouched();

                    $scope.user = angular.copy($scope.master);

                    $timeout(function(){
                        $cordovaProgress.hide();
                    });

                    goHome();
                }, function(e) {
                    AnalyticsService.track('error', {code:  e.code, message: e.message});

                    $timeout(function(){
                        $cordovaProgress.hide();
                    });
                    $timeout(function(){
                        $cordovaDialogs.alert(e.message, 'Error', 'Ok');
                    });
                });
        }
    }

    $scope.signup = function(form){
        if ($scope.checkForm(form)) {
            $timeout(function(){
                $cordovaProgress.showSimpleWithLabelDetail(true, 'Creating Account', 'Please wait a second');
            });

            var data = angular.copy($scope.user);

            data.role = $scope.userType;

            User
                .signUp(data)
                .then(function(u){
                    AnalyticsService.track('signup', {user: User.current().id});

                    _onLogin();

                    form.$setPristine();
                    form.$setUntouched();

                    $scope.user = angular.copy($scope.master);

                    $timeout(function(){
                        $cordovaProgress.hide();
                    });

                    goHome();
                    console.log(u, 'signup', $rootScope.user);
                }, function(e){
                    console.log('error on signup', e);
                    AnalyticsService.track('error', {code:  e.code, message: e.message});

                    $timeout(function(){
                        $cordovaProgress.hide();
                    });
                    $timeout(function(){
                        $cordovaDialogs.alert(e.message, 'Error', 'Ok');
                    });
                });
        }
    }

    $scope.checkForm = function(form){
        var isEqual = ($scope.user.password === $scope.user.passwordConfirmation);
        var valid = false;

        if(form.$valid && isEqual){
            valid = true;
        }

        return valid;
    };

    var goHome = function(){
        $rootScope.role = $rootScope.user.get('role');
        $state.go('app.home');
    };

    $ionicPlatform.ready(function() {
        $cordovaSplashscreen.hide();

        function facebookLogin(response) {
            if (!response.authResponse) {
                $cordovaDialogs.alert('An error has occurred while trying to stablish communication with Facebook, please try again.', 'Error', 'Ok');
            } else {
                var expDate = new Date(
                    new Date().getTime() + response.authResponse.expiresIn * 1000
                ).toISOString();

                var authData = {
                    id: String(response.authResponse.userID),
                    access_token: response.authResponse.accessToken,
                    expiration_date: expDate,
                };

                var data = {
                    authData: authData,
                    provider: 'facebook',
                    role: $scope.userType
                }

                $timeout(function(){
                    $cordovaProgress.showSimpleWithLabelDetail(true, 'Connecting', 'Please wait a second');
                });

                User
                    .signUp(data)
                    .then(function(u){
                        $cordovaFacebook.api("me?fields=" + FB_DEFAULT_FIELDS.join(','), FB_DEFAULT_PERMISSIONS)
                            .then(function(data) {
                                _onLogin();

                                User.current().save({
                                        gender: data.gender || '',
                                        firstName: data.first_name,
                                        lastName: data.last_name,
                                        name: data.name,
                                        fullName: data.first_name + ' ' + data.last_name,
                                        avatar: 'http://graph.facebook.com/' + data.id + '/picture?type=large',
                                        facebook: true
                                    })
                                    .then(function() {
                                        $timeout(function(){
                                            $cordovaProgress.hide();
                                        });

                                        goHome();
                                    }, function(e) {
                                        AnalyticsService.track('error', {code:  e.code, message: e.message, user: $rootScope.user.id});

                                        $timeout(function(){
                                            $cordovaProgress.hide();
                                        });

                                        goHome();
                                    });
                            }, function(e) {
                                AnalyticsService.track('error', {code:  e.code, message: e.message});

                                $timeout(function(){
                                    $cordovaProgress.hide();
                                });

                                goHome();
                            });
                    }, function(e){
                        AnalyticsService.track('error', {code:  e.code, message: e.message});

                        $timeout(function(){
                            $cordovaProgress.hide();
                        });

                        $cordovaDialogs.alert(e.message, 'Error', 'Ok');
                    });
            }
        };

        $scope.facebookLogin = function() {
            $cordovaFacebook.getLoginStatus()
                .then(function(response) {
                    switch (response.status) {
                        case 'connected':
                            facebookLogin(response);
                            break;
                        default:
                            $cordovaFacebook.login(FB_DEFAULT_PERMISSIONS)
                                .then(facebookLogin, function(e) {
                                    AnalyticsService.track('error', {code:  e.code, message: e.message});

                                    $timeout(function(){
                                        $cordovaDialogs.alert('We have not been able to connect with your Facebook account, please try again', 'Error', 'Ok');
                                    });
                                });
                            break;
                    }
                }, function(e) {
                    AnalyticsService.track('error', {code:  e.code, message: e.message});

                    $timeout(function(){
                        $cordovaDialogs.alert('We have not been able to connect with your Facebook account, please try again', 'Error', 'Ok');
                    });
                });
        };
    });
})

.controller('ForgotCtrl', function($rootScope, $scope, $state, $timeout, User, $ionicLoading){
    $scope.userMaster = {username: '', phone: ''};
    $scope.user = angular.copy($scope.userMaster);
    $scope.login = function(){
        $ionicLoading.show({template: 'Verifying...'});
        User
            .forgot($scope.user.username, $scope.user.phone)
            .then(function(){
                $rootScope.user = User.current();
                $state.go('resetPassword');
            }, function(e){
                alert(e.message);
            })
            .finally(function(){
                $scope.user = angular.copy($scope.userMaster);
                $ionicLoading.hide();
            })
    };
})

.controller('ResetCtrl', function($rootScope, $scope, $state, $timeout, User, $ionicLoading){
    var _ = require('lodash');

    $scope.userMaster = {username: '', phone: '', verificationCode: '', newPassword: '', newPasswordConfirmation: ''};
    $scope.user = angular.copy($scope.userMaster);
    $scope.login = function(){
        $ionicLoading.show({template: 'Verifying...'});
        User
            .forgot($scope.user.username, $scope.user.phone)
            .then(function(){
                $rootScope.user = User.current();
                $state.go('resetPassword');
            }, function(e){
                alert(e.message);
            })
            .finally(function(){
                $scope.user = angular.copy($scope.userMaster);
                $ionicLoading.hide();
            })
    };
});
