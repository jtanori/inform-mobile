angular.module('inform.services')

.factory('UUID', function(){
    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    }

    return {generate: guid};
})

.factory('AuthService', function($http, $q, API_URL){
    'use strict';

    return {
        signUp: function(a, b, c){
            var defer = $q.defer();
            var config = _.isObject(a) ? a : {username: a, password: b, role: c};

            console.log('config', config);

            $http
                .post(API_URL + '/auth/signup', config)
                .then(function(c){
                    if(!_.isEmpty(c)){
                        console.log('signup', c);
                        $http.defaults.headers.common['X-Parse-User-Token'] = c.data.user.sessionToken;
                        defer.resolve(c.data);
                    }else{
                        defer.reject({message: 'Invalid user', code: 403});
                    }
                }, function(e){
                    if(!_.isEmpty(e) && !_.isEmpty(e.data)){
                        defer.reject({message: e.data.message, code: e.status});
                    }else{
                        defer.reject({message: 'Unknown error', code: e.status});
                    }
                });

            return defer.promise;
        },
        logIn: function(username, password){
            var defer = $q.defer();

            $http
                .post(API_URL + '/auth/login', {username:username, password: password})
                .then(function(c){
                    if(!_.isEmpty(c)){
                        $http.defaults.headers.common['X-Parse-User-Token'] = c.data.user.sessionToken;
                        defer.resolve(c.data);
                    }else{
                        defer.reject({message: 'Invalid user', code: 403});
                    }
                }, function(e){
                    if(!_.isEmpty(e) && !_.isEmpty(e.data)){
                        defer.reject({message: e.data.message, code: e.status});
                    }else{
                        defer.reject({message: 'Unknown error', code: e.status});
                    }
                });

            return defer.promise;
        },
        logOut: function(){
            var defer = $q.defer();

            console.log('logout');

            $http
                .post(API_URL + '/auth/logout', {})
                .then(function(c){
                    console.log('logout done', c);
                    defer.resolve(c);
                }, function(e){
                    if(!_.isEmpty(e) && !_.isEmpty(e.data)){
                        defer.reject({message: e.data.message, code: e.status});
                    }else{
                        defer.reject({message: 'Unknown error', code: e.status});
                    }
                });

            return defer.promise;
        }
    }
});
