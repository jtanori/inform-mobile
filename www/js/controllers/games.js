angular.module('inform.controllers')

.controller('GameCtrl', function(
    $rootScope,
    $scope,
    $state,
    $timeout,
    User,
    $ionicLoading,
    $ionicPlatform,
    GameService,
    TeamService,
    GAME_DATE_DEFAULT,
    $ionicModal,
    GOOGLE_MAPS_DEFAULT_MAP_CONFIG,
    $cordovaDialogs,
    $cordovaGeolocation){

    if(_.isEmpty($rootScope.user)){
        $state.go('auth');
        return;
    }

    $scope.modal  = null;

    $scope.gameMaster = {
        date: moment().format('D MMMM YYYY'),
        hour: moment().format('h')*1,
        minute: Math.ceil(moment().format('mm')*1/10)*10,
        opponent: null,
        tournament: null,
        location: null,
        instructions: ''
    };

    $scope.game = angular.copy($scope.gameMaster);
    $scope.teams = User.current().get('teams');
    $scope.opponents = User.current().get('opponents');
    $scope.query = null;

    console.log('opponents', $scope.opponents);

    //Submit team search form from modal
    $scope.submit = function(q){
        if(q){
            $timeout(function(){
                $scope.$apply(function(){
                    $scope.searching = true;
                });
            });

            TeamService
                .search(q, User.current().get('teams').map(function(t){return t.objectId;}))
                .then(function(t){
                    $scope.opponents = t;
                },function(e){
                    $scope.searchError = e.message;
                })
                .finally(function(){
                    $timeout(function(){
                        $scope.$apply(function(){
                            $scope.searching = false;
                        });
                    });
                });
        }else{
            $timeout(function(){
                $scope.$apply(function(){
                    $scope.opponents = [];
                });
            });
        }
    }

    //Open opponent modal
    $scope.openOpponentModal = function(){
        if(!$scope.modal){
            $ionicModal.fromTemplateUrl('templates/modals/opponent.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(m) {
                $scope.modal = m;
                $scope.modal.show();

                if($scope.map){
                    $scope.map.setClickable(false);
                }
            });
        }else{
            $scope.modal.show();
            if($scope.map){
                $scope.map.setClickable(false);
            }
        }
    };

    //Close opponent search modal
    $scope.closeOpponentModal = function() {
        if($scope.modal){
            $scope.modal.hide();
        }
    };

    //Set challenger team
    $scope.setChallenger = function(id){
        var c = $scope.teams.find(function(t){
            if(t.objectId === id){
                return t;
            }
        });

        if(!_.isEmpty(c)){
            $timeout(function(){
                $scope.$apply(function(){
                    $scope.game.challenger = c;
                });
            });
        }
    }

    //Set oponent in the game object, hides the opponent modal after
    $scope.setOpponent = function(id){
        var c = $scope.opponents.find(function(t){
            if(t.objectId === id){
                return t;
            }
        });

        if(!_.isEmpty(c)){
            $timeout(function(){
                $scope.$apply(function(){
                    $scope.game.opponent = c;
                });
            });
        }
    };

    //Cancel searching for opponent
    $scope.cancelOpponent = function(){
        $timeout(function(){
            $scope.$apply(function(){
                $scope._preselectedOpponent = null;
                $scope.closeOpponentModal();
                $scope.map.setClickable(true);
            });
        });
    };

    //Presect opponent from modal
    $scope.preselectOpponent = function(o){
        $timeout(function(){
            $scope.$apply(function(){
                $scope._preselectedOpponent = o;
            });
        });
    };

    //Geocode address, adds pin to map
    $scope.geocode = function(a){
        if($scope.map){
            if(!_.isEmpty(a)){
                $scope.map.clear();

                plugin.google.maps.Geocoder.geocode({address: a}, function(results) {
                    if (results.length && results.length === 1) {
                        var result = results[0];
                        var position = result.position;
                        var address = [
                            result.subThoroughfare || "",
                            result.thoroughfare || "",
                            result.locality || "",
                            result.adminArea || "",
                            result.postalCode || "",
                            result.country || ""].join(", ");

                        $scope.map.addMarker({
                            'position': position,
                            'title':  address,
                            'draggable': true
                        }, function(marker) {

                            $scope.locationMarker = marker;

                            $scope.map.animateCamera({
                                'target': position,
                                'zoom': 16
                            }, function() {
                                marker.showInfoWindow();
                            });

                            $scope.game.location = {lat: position.lat, lng: position.lng};

                        });
                    } else {
                        $scope.map.clear();
                    }
                });
            }else{
                $scope.map.clear();
            }
        }
    };

    //Check if game can be saves (validate)
    $scope.canSave = function(){
        var valid = false;
        var g = $scope.game;


        console.log(g, 'game');
        console.log(g.location, g.opponent, g.challenger, g.fieldType, g.home, g._date, _.isDate(g._date));
        //check if required data is present
        if(!_.isEmpty(g.location) && !_.isEmpty(g.opponent) && !_.isEmpty(g.challenger) && !_.isEmpty(g.fieldType) && !_.isEmpty(g.home) && !_.isEmpty(g._date)){
            //Check if date, location, challenger and opponent are present
            console.log('all is present');
            if(!_.isDate(g._date)){
                valid = false;
            }else if(_.isEmpty(d.location.lat) || _.isEmpty(g.location.lng)){
                valid = false;
            }else if(_.isEmpty(g.challenger.objectId) || _.isEmpty(g.opponent.objectId)){
                valid = false;
            }else {
                valid = true;
            }
        }

        return valid;
    };

    //Save game (only if validation passes)
    $scope.save = function(){
        var data = angular.copy($scope.game);

        console.log('data to save');

        data.challenger = data.challenger.objectId;
        data.opponent = data.opponent.objectId;
        data.date = data._date*1;
        data.lat = data.location.lat;
        data.lng = data.location.lng;

        delete data.location;
        delete data._date;
        delete data.hour;
        delete data.minute;

        console.log('data', data);

        $ionicLoading.show({template: '<ion-spinner></ion-spinner><br />Saving Game...'});

        GameService
            .create(data, $rootScope.user.get('objectId'))
            .then(function(g){
                if(g){
                    $cordovaDialogs.alert('Your game has been scheduled, get ready to play.', 'Done', 'OK');
                    var games = User.current().get('games') || [];

                    games.push(g);

                    User.current().saveToLocal('games', games);

                    $scope.game = angular.copy($scope.gameMaster);

                    if($scope.map){
                        $scope.map.clear();
                    }

                    $state.go('app.home');
                }else{
                    $cordovaDialogs.alert('Looks like the game was not created, please try again.', 'Error', 'OK');
                }
            }, function(e){
                $cordovaDialogs.alert(e.message, 'Error', 'OK');
            })
            .finally(function(){
                $ionicLoading.hide();
            });
    };

    //On view enter
    $scope.$on('$ionicView.enter', function(){
        if($scope.teams.length === 1){
            $scope.game.challenger = $scope.teams[0];
        }

        if(_.isEmpty($scope.opponents)){
            $ionicLoading.show({template: 'Loading Saved Opponents'});

            TeamService
                .getOpponentsByUserId($rootScope.user.get('objectId'))
                .then(function(r){
                    if(!_.isEmpty(r)){
                        $timeout(function(){
                            $scope.$apply(function(){
                                $scope.opponents = r;
                                console.log('opponents', r);
                                $rootScope.user.saveToLocal('opponents', r);
                            });
                        });
                    }else {
                        $timeout(function(){
                            $scope.$apply(function(){
                                $scope.opponents = [];
                            });
                        });
                    }
                }, function(e){
                    $timeout(function(){
                        $cordovaDialogs.alert(e.message, 'Error', 'OK');
                    });
                })
                .finally(function(){
                    $ionicLoading.hide();
                });
        }
    });

    //When ready
    $ionicPlatform.ready(function(){
        $scope.pickADate = function(){
            datePicker.show(GAME_DATE_DEFAULT(), function(d){
                $scope.game._date = new Date(d);
            });
        };

        $scope.getPosition = function(){
            $ionicLoading.show({template: '<ion-spinner></ion-spinner><br />Calculating Position...'});

            $cordovaGeolocation
                .getCurrentPosition({timeout: 10000, enableHighAccuracy: true})
                .then(function(position){
                    if(position && position.coords && position.coords.latitude && position.coords.longitude){
                        var position = new plugin.google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                        $scope.map.addMarker({
                            'position': position,
                            'title':  'My Position',
                            'draggable': true
                        }, function(marker) {

                            $scope.locationMarker = marker;

                            $scope.map.animateCamera({
                                'target': position,
                                'zoom': 16
                            }, function() {
                                marker.showInfoWindow();
                            });

                            $scope.game.location = {lat: position.lat, lng: position.lng};

                        });
                    }else{
                        $timeout(function(){
                            $cordovaDialogs.alert('Geolocation did not return a valid position, please try again', 'Error', 'OK');
                        });
                    }
                }, function(e){
                    $timeout(function(){
                        $cordovaDialogs.alert(e.message, 'Error', 'OK');
                    });
                })
                .finally(function(){
                    $ionicLoading.hide();
                });
        };

        // Initialize the map plugin
        var map = plugin.google.maps.Map.getMap(document.getElementById("new-game-location"));
        //Wait for the map to be ready
        map.on(plugin.google.maps.event.MAP_READY, function(map){
            //Center map to the USA center
            var l = new plugin.google.maps.LatLng(GOOGLE_MAPS_DEFAULT_MAP_CONFIG.center.latitude, GOOGLE_MAPS_DEFAULT_MAP_CONFIG.center.longitude);

            map.animateCamera({
                target: l,
                zoom: GOOGLE_MAPS_DEFAULT_MAP_CONFIG.config
            });

            $scope.map = map;
            $scope.map.clear();
            $scope.map.setBackgroundColor('rgb(245,245,245)');
        });

        $scope.$watch('game.location', function(n, p){
            console.log('location changed', n, p);
        });

        $scope.$watch('locationMarker', function(c, n){
            console.log('location marker change', c, n);
        });
    });
})

.controller('GameViewCtrl', function(){
    console.log('game view controller');
});
