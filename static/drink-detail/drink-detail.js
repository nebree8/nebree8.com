angular.module('nebree8.drink-detail', [])

.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/drinks/:drinkName', {
        templateUrl: 'drink-detail/drink-detail.html',
        controller: 'DrinkDetailCtrl',
      });
  }
])

.controller('DrinkDetailCtrl', ['$scope', '$http', '$mdDialog', '$routeParams', '$location',
  function($scope, $http, $mdDialog, $routeParams, $location) {
    var drinkName = $routeParams.drinkName;
    var originalDrink = {};
    $scope.selected_drink = {};
    $scope.parts_max = 10;

    $http.get('/all_drinks', { cache: true }).success(function(data) {
      for (var i = 0; i < data.length; i++) {
        if (slugifyDrink(data[i].drink_name) == drinkName) {
          originalDrink = data[i];
          $scope.reset();
          var parts_max = 4;
          for (var j = 0; j < originalDrink.ingredients.length; j++) {
            var parts = originalDrink.ingredients[j].parts;
            if (parts && parts > parts_max) {
              parts_max = parts;
            }
          }
          $scope.parts_max = parts_max * 1.5;
          return;
        }
      }
      console.log("Didn't find drink, redirecting", drinkName, data);
      $location.path('/drinks').replace();
    });

    $scope.makeDrink = function(event) {
      var EnterNameController = ['$scope', '$mdDialog', function($scope,
        $mdDialog, user_name) {
        $scope.user_name = user_name;
        $scope.$broadcast('dialogOpened');
        $scope.closeDialog = function() {
          $mdDialog.hide($scope.user_name);
        };
        $scope.cancel = function() {
          $mdDialog.hide(null);
        }
      }];
      $mdDialog.show({
          controller: EnterNameController,
          targetEvent: event,
          locals: {
            user_name: $scope.user_name
          },
          template: '<md-dialog aria-label="Enter your name">' +
            ' <form ng-submit="closeDialog()"> ' +
            ' <md-toolbar><div class="md-toolbar-tools"> ' +
            '  <h2>What should we call you?</h2> ' +
            '  <span flex></span><md-button class="md-icon-button" ' +
            '      ng-click="cancel()"><md-icon md-svg-src="img/icons/ic_close_24px.svg" aria-label="Close dialog"></md-icon></md-button> ' +
            ' </div></md-toolbar> ' +
            ' <md-dialog-content>' +
            '   <md-input-container><label>Your Name</label> ' +
            '   <input type="text" ng-model="user_name" focus-on="dialogOpened"> ' +
            '   </md-input-container> ' +
            ' </md-dialog-content>' +
            ' <div class="md-actions"> ' +
            '  <md-button ng-click="cancel()">Cancel</md-button> ' +
            '  <md-button type="submit" ng-disabled="!user_name" class="md-primary"> ' +
            '      Make Drink</md-button> ' +
            ' </div> ' +
            ' </form> ' +
            '</md-dialog>'
        })
        .then(function(answer) {
          console.log("answer", answer);
          if (answer) {
            $scope.user_name = $scope.selected_drink.user_name = answer;
            $scope.drink_id = 'unknown';
            $http({
              'method': 'POST',
              'url': '/api/order',
              'params': {
                'recipe': $scope.selected_drink
              },
              'responseType': 'json'
            }).then(function(response) {
              console.log("response", response)
              $scope.drink_id = response.data.id;
            })
            console.log("Making drink ", $scope.selected_drink);
            $scope.selectDrink(null);
          }
        }, function() {
          console.log("dialog cancelled");
        });
    }

    $scope.cancel = function() {
      $location.path("/drinks");
    }

    $scope.reset = function() {
      $scope.selected_drink = angular.copy(originalDrink);
    }

    $scope.modified = function() {
      return !angular.equals($scope.selected_drink, originalDrink);
    }
  }
]);
