angular.module('inform.controllers')

.controller('TeamCtrl', function(
    $rootScope,
    $scope,
    $state,
    $timeout,
    $stateParams,
    User,
    $ionicLoading,
    $ionicPlatform,
    $ionicHistory,
    $cordovaActionSheet,
    $cordovaImagePicker,
    $cordovaCamera,
    BASE_64,
    CREST_DEFAULT,
    $cordovaDialogs,
    TeamService
){
    if(_.isEmpty($rootScope.user)){
        $state.go('auth');
        return;
    }

    $scope.fromImages = false;
    $scope.crestSrc = null;
    $scope.teamMaster = {
        name: null,
        description: null,
        crest: null,
        coach: null
    };
    $scope.team = angular.copy($scope.teamMaster);
    $scope.asOpponent = $stateParams.as === "opponent" ? true : false;

    $scope.valid = function(form){
        var valid = false;

        if(!form.$invalid && !_.isEmpty($scope.team) && !_.isEmpty($scope.team.name) && !_.isEmpty($scope.team.description) && !_.isEmpty($scope.team.crest)){
            valid = true;
        }

        return valid;
    };

    $scope.back = function(){
        if($ionicHistory.currentView().stateName === 'app.addOpponent'){
            $state.go('app.addGame');
        }else{
            $state.go('app.home');
        }
    };

    $scope.create = function(form){
        if($scope.valid(form)){
            $ionicLoading.show({template: '<ion-spinner></ion-spinner><br />Creating Team...'});

            var f = TeamService.create;
            var data = angular.copy($scope.team);

            if($scope.asOpponent){
                f = TeamService.createOpponent
                data.manager = $rootScope.user.get('objectId');
            }

            f(data)
                .then(function(t){
                    $timeout(function(){
                        if($scope.asOpponent){
                            var opponents = $rootScope.user.get('opponents') || [];
                            opponents.push(t);

                            console.log('new opponent to be added', t, opponents);

                            $rootScope.user.saveToLocal('opponents', opponents);
                        }

                        $cordovaDialogs.alert('Your team has been created, let\'s play!', 'Done', 'OK');
                        $scope.back();
                    });
                }, function(e){
                    $timeout(function(){
                        $cordovaDialogs.alert(e.message, 'Error', 'OK');
                    });
                })
                .finally(function(){
                    $ionicLoading.hide();
                });
        }else{
            $cordovaDialogs.alert('Team data seems invalid, please check your team details.');
        }
    };

    $scope.$on('$ionicView.leave', function(){
        $scope.team = angular.copy($scope.teamMaster);
        $scope.fromImages = false;
    });

    $ionicPlatform.ready(function(){
        $scope.team = angular.copy($scope.teamMaster);
        $scope.fromImages = false;

        $scope.selectCrest = function(){
            $cordovaActionSheet
                .show({
                    title: 'Grab image from',
                    buttonLabels: ['Camera', 'My Images'],
                    addCancelButtonWithLabel: 'Cancel',
                    androidEnableCancelButton : true,
                    winphoneEnableCancelButton : true
                })
                .then(function(i){
                    switch(i){
                    case 1:
                        $scope.fromImages = false;
                        loadPicture();
                        break;
                    case 2:
                        $scope.fromImages = true;
                        loadPicture(Camera.PictureSourceType.SAVEDPHOTOALBUM);
                        break;
                    }
                });
        };

        var loadPicture = function(source){
            source = source || Camera.PictureSourceType.CAMERA;

            $cordovaCamera
                .getPicture({
                    quality: CREST_DEFAULT.quality,
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: source,
                    allowEdit: true,
                    encodingType: Camera.EncodingType.JPEG,
                    targetWidth: CREST_DEFAULT.width,
                    targetHeight: CREST_DEFAULT.height,
                    saveToPhotoAlbum: true,
                    correctOrientation:true
                })
                .then(function(imageData) {
                    $timeout(function(){
                        $scope.$apply(function(){
                            $scope.team.crest = BASE_64.JPEG + imageData;
                        });
                    });
                }, function(e) {
                    console.log(e, 'error');
                    if(e){
                        $timeout(function(){
                            $scope.team.crest = null;
                            $cordovaDialogs.alert(e, 'Error', 'OK');
                        });
                    }
                });
        }
    })
})

.controller('TeamViewCtrl', function(){
    console.log('team view controller');
})
