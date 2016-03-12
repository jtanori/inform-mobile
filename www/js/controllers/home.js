angular.module('inform.controllers')

.controller('HomeCtrl', function($rootScope, $scope, $state, $timeout, User, $ionicLoading, $ionicHistory, TeamService, GameService){
    if(_.isEmpty($rootScope.user)){
        $state.go('auth');
        return;
    }

    $scope.role = $rootScope.user.get('role');

    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
    $scope.loadingTeams = false;
    $scope.teams = [];
    $scope.teamError = null;
    $scope.games = [];
    $scope.gamesError = null;

    $scope.$on('$ionicView.enter', function(){
        if(_.isEmpty($scope.teams)){
            $timeout(function(){
                $scope.$apply(function(){
                    $scope.loadingTeams = true;
                });

                console.log($rootScope.user);

                TeamService
                    .getAllByUserId($rootScope.user.get('objectId'))
                    .then(function(t){
                        $timeout(function(){
                            $scope.$apply(function(){
                                $scope.teams = t;
                                $scope.teamsError = null;

                                User.current().saveToLocal('teams', t);
                            });
                        });
                    }, function(e){
                        $timeout(function(){
                            $scope.$apply(function(){
                                $scope.teams = [];
                                $scope.teamsError = e.message;
                            });
                        });
                    })
                    .finally(function(){
                        $timeout(function(){
                            $scope.$apply(function(){
                                $scope.loadingTeams = false;
                            });
                        });
                    });
            })
        }else{
            console.log('we have teams, just update');
        }

        //Load games
        if(_.isEmpty($scope.games)){
            $timeout(function(){
                $scope.$apply(function(){
                    $scope.loadingGames = true;
                });

                GameService
                    .getAllByUserId($rootScope.user.get('objectId'), new Date()*1)
                    .then(function(t){
                        $timeout(function(){
                            $scope.$apply(function(){
                                $scope.games = t;
                                $scope.gamesError = null;

                                $scope.games = $scope.games.map(function(g){
                                    g.displayDate = moment(g.date).format('MMM D, h:mm');

                                    return g;
                                });

                                console.log('loaded games', $scope.games);

                                User.current().saveToLocal('games', t);
                            });
                        });
                    }, function(e){
                        $timeout(function(){
                            $scope.$apply(function(){
                                $scope.games = [];
                                $scope.gamesError = e.message;
                            });
                        });
                    })
                    .finally(function(){
                        $timeout(function(){
                            $scope.$apply(function(){
                                $scope.loadingGames = false;
                            });
                        });
                    });
            })
        }else{
            console.log('we have games, just update');
        }
    });
});
