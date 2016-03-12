angular.module('inform.services')

.factory('TeamService', function($http, $q, API_URL){
    return {
        create: function(config){
            var defer = $q.defer();

            $http
                .post(API_URL + '/teams/add', config)
                .then(function(t){
                    defer.resolve(t.data);
                }, function(e){
                    defer.reject(e.data);
                })

            return defer.promise;
        },
        createOpponent: function(config){
            var defer = $q.defer();

            $http
                .post(API_URL + '/teams/add/opponent', config)
                .then(function(t){
                    defer.resolve(t.data);
                }, function(e){
                    defer.reject(e.data || {message: 'An error has occurred while creating your opponent, please try again'});
                })

            return defer.promise;
        },
        update: function(id, config){
            var defer = $q.defer();

            $http
                .patch(API_URL + '/teams/update/' + id, config)
                .then(function(t){
                    defer.resolve(t.data);
                }, function(e){
                    defer.reject(e.data);
                })

            return defer.promise;
        },
        addPlayer: function(id, playerId){
            var defer = $q.defer();

            $http
                .put(API_URL + '/teams/add/' + id + '/player', {player: playerId})
                .then(function(t){
                    defer.resolve(t);
                }, function(e){
                    defer.reject(e);
                })

            return defer.promise;
        },
        search: function(term){
            var defer = $q.defer();

            $http
                .post(API_URL + '/teams/search', {q: term})
                .then(function(t){
                    defer.resolve(t.data.results);
                }, function(e){
                    defer.reject(e.data);
                })

            return defer.promise;
        },
        getById: function(id){
            var defer = $q.defer();

            $http
                .get(API_URL + '/teams/get/' + id)
                .then(function(t){
                    defer.resolve(t);
                }, function(e){
                    defer.reject(e);
                })

            return defer.promise;
        },
        getAllByUserId: function(id){
            var defer = $q.defer();

            $http
                .get(API_URL + '/teams/get/user/' + id)
                .then(function(t){
                    defer.resolve(t.data.results || []);
                }, function(e){
                    defer.reject(e.data);
                });

            return defer.promise;
        },
        getOpponentsByUserId: function(id){
            var defer = $q.defer();

            $http
                .get(API_URL + '/teams/get/opponents/' + id)
                .then(function(t){
                    defer.resolve(t.data.results || []);
                }, function(e){
                    defer.reject(e.data || {message: 'An error has occurred while getting opponents'});
                });

            return defer.promise;
        }
    }
});
