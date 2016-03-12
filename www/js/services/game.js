angular.module('inform.services')

.factory('GameService', function($http, $q, API_URL){
    return {
        create: function(config){
            var defer = $q.defer();

            $http
                .post(API_URL + '/games/add', config)
                .then(function(t){
                    defer.resolve(t.data);
                }, function(e){
                    defer.reject(e.data);
                })

            return defer.promise;
        },
        update: function(id, config){
            var defer = $q.defer();

            $http
                .patch(API_URL + '/games/update/' + id, config)
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
                .put(API_URL + '/games/add/' + id + '/player', {player: playerId})
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
                .get(API_URL + '/games/search')
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
                .get(API_URL + '/games/get/' + id)
                .then(function(t){
                    defer.resolve(t);
                }, function(e){
                    defer.reject(e);
                })

            return defer.promise;
        },
        getAllByUserId: function(id, date){
            var defer = $q.defer();

            $http
                .get(API_URL + '/games/get/user/' + id + '?minDate=' + date)
                .then(function(t){
                    defer.resolve(t.data.results || []);
                }, function(e){
                    defer.reject(e.data);
                })

            return defer.promise;
        }
    }
});
