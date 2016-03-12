// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js

angular.module('inform.controllers', []);
angular.module('inform.services', []);
angular.module('inform.directives', []);

angular.module('inform', ['ng', 'ionic', 'ngCordova', 'inform.controllers', 'inform.services', 'ngIOS9UIWebViewPatch'])

.constant('API_URL', 'http://inform-api-stage.herokuapp.com')
//.constant('API_URL', '/api')//Local dev settings, see proxy settings
.constant('APP_ID', 'd4e2f913-8f16-4500-8046-49bc236f2ce0')
.constant('JS_KEY', '3ef81836-0e00-4dd0-89c0-4d4ea7902f03')
.constant('FB_DEFAULT_PERMISSIONS', ["public_profile", "email", "user_friends"])
.constant('FB_DEFAULT_FIELDS', ['email', 'name', 'first_name', 'last_name', 'id', 'gender', 'link', 'timezone'])
.constant('DEFAULT_SETTINGS', {})
.constant('GOOGLE_MAPS_DEFAULT_MAP_CONFIG', {center: {latitude: 37.090240, longitude: -95.712891}, zoom: 12})
.factory('GAME_DATE_DEFAULT', function(){
    return function(){
        return {
            mode: 'datetime',
            date: new Date(),
            minDate: new Date(),
            titleText: 'Please Select a Date',
            okText: 'OK',
            cancelText: 'Cancel',
            todayText: 'Today',
            nowText: 'Now',
            allowOldDates: false,
            minuteInterval: 15
        };
    };
})
.constant('BASE_64', {
    JPEG: 'data:image/jpeg;base64,',
    PNG: 'data:image/png;base64,'
})
.constant('CREST_DEFAULT', {
    quality: 80,
    width: 600,
    height: 600
})
.run(function($http, $rootScope, $state, APP_ID, JS_KEY, User, $timeout, $ionicScrollDelegate, $ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.Keyboard) {
            Keyboard.disableScrollingInShrinkView(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleLightContent();
        }
        //Force portrait lock
        if(window.screen){
            window.screen.lockOrientation('portrait');
        }

        if(navigator.splashscreen){
            navigator.splashscreen.hide();
        }

        window.addEventListener('native.keyboardshow', function(){
            document.body.classList.add('keyboard-open');
        });

        window.addEventListener('native.keyboardhide', function(){
            document.body.classList.remove('keyboard-open');
        });
    });

    $http.defaults.headers.common['X-Parse-Application-Id'] = APP_ID;
    $http.defaults.headers.common['X-Parse-Javascript-Key'] = JS_KEY;

    //Set user in root
    $rootScope.user = User.current();

    if($rootScope.user){
        $rootScope.role = $rootScope.user.getCurrentRole();
        $http.defaults.headers.common['X-Parse-User-Token'] = $rootScope.user.get('sessionToken');
    }

    $rootScope.$on('$stateChangeStart', function (event, next, nextParams, fromState) {
        if (!$rootScope.user) {
            console.log(next.name, 'name');
            switch (next.name) {
                case 'forgot':
                case 'resetPassword':
                case 'playerSignup':
                case 'managerSignup':
                case 'login':
                case 'signup':
                case 'auth':
                    break;
                default:
                    event.preventDefault();
                    $state.go('auth');
                    break;
            }
        }
    });
})
.factory('responseObserver', function responseObserver($q, $window, $rootScope) {
    return {
        responseError: function(errorResponse) {
            switch (errorResponse.status) {
            case 403:
                if(errorResponse && errorResponse.data && errorResponse.data.code === 209){
                    $rootScope.user.logOut();
                    $rootScope.user = null;
                }

                $window.location.hash = 'auth';
                break;
            }
            return $q.reject(errorResponse);
        }
    };
})
.factory('$localStorage', ['$window', function($window) {
    return {
        set: function(key, value) {
            $window.localStorage[key] = value;
        },
        get: function(key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        setObject: function(key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function(key) {
            return JSON.parse($window.localStorage[key] || '{}');
        },
        removeItem: function(item){
            $window.localStorage.removeItem(item);
        }
    }
}])
.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider) {
    $stateProvider

        .state('app', {
            url: '',
            abstract: true,
            templateUrl: 'templates/menu.html',
            controller: 'MenuCtrl'
        })

        .state('app.home', {
            url: '/home',
            views: {
                'menuContent': {
                    templateUrl: 'templates/home.html',
                    controller: 'HomeCtrl'
                }
            }
        })

        .state('app.addTeam', {
            url: '/home/new-team',
            views: {
                'menuContent': {
                    templateUrl: 'templates/team/new.html',
                    controller: 'TeamCtrl'
                }
            }
        })

        .state('app.addGame', {
            url: '/home/new-game',
            views: {
                'menuContent': {
                    templateUrl: 'templates/game/new.html',
                    controller: 'GameCtrl'
                }
            }
        })

        .state('app.addOpponent', {
            url: '/home/new-team/:as',
            views: {
                'menuContent': {
                    templateUrl: 'templates/team/new-opponent.html',
                    controller: 'TeamCtrl'
                }
            }
        })

        .state('app.settings', {
            url: '/settings',
            views: {
                'menuContent': {
                    templateUrl: 'templates/settings.html',
                    controller: 'SettingsCtrl'
                }
            }
        })

        .state('app.profile', {
            url: '/profile',
            views: {
                'menuContent': {
                    templateUrl: 'templates/profile.html',
                    controller: 'ProfileCtrl'
                }
            }
        })

        .state('app.about', {
            url: '/about',
            views: {
                'menuContent': {
                    templateUrl: 'templates/about.html'
                }
            }
        })

        .state('app.players', {
            url: '/players',
            views: {
                'menuContent': {
                    templateUrl: 'templates/players.html',
                    controller: 'PlayersCtrl'
                }
            }
        })

        .state('app.game', {
            url: '/games/:id',
            views: {
                'menuContent': {
                    templateUrl: 'templates/game/view.html',
                    controller: 'GameViewCtrl'
                }
            }
        })

        .state('app.team', {
            url: '/teams/:id',
            views: {
                'menuContent': {
                    templateUrl: 'templates/team/view.html',
                    controller: 'TeamViewCtrl'
                }
            }
        })

        .state('auth', {
            url: '/auth',
            templateUrl: 'templates/login-splash.html',
            controller: 'AuthCtrl'
        })

        .state('signup', {
            url: '/signup/:as',
            templateUrl: 'templates/signup.html',
            controller: 'LoginCtrl'
        })

        .state('login', {
            url: '/login',
            templateUrl: 'templates/login.html',
            controller: 'LoginCtrl'
        })

        .state('forgot', {
            url: '/forgot',
            templateUrl: 'templates/forgot.html',
            controller: 'ForgotCtrl'
        })

        .state('resetPassword', {
            url: '/forgot/reset',
            templateUrl: 'templates/reset.html',
            controller: 'ResetCtrl'
        });

    $urlRouterProvider.otherwise(function ($injector, $location) {
        var $state = $injector.get("$state");
        $state.go("auth");
    });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/auth');

    $ionicConfigProvider.tabs.position('bottom');
    $httpProvider.interceptors.push('responseObserver');
});
