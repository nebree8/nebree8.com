angular.module('nebree8.drink-detail', [])

.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/drinks/random', {
        templateUrl: 'drink-detail/drink-detail.html',
        controller: 'RandomDrinkCtrl',
      }).
      when('/drinks/:drinkName', {
        templateUrl: 'drink-detail/drink-detail.html',
        controller: 'NamedDrinkCtrl',
      });
  }
])

.controller('DrinkDetailCtrl', ['$scope', '$http', '$mdDialog', '$routeParams', '$location',
  function($scope, $http, $mdDialog, $routeParams, $location) {
    var originalDrink = {};
    $scope.selected_drink = {};
    $scope.parts_max = 10;

    $scope.setRecipe = function(recipe) {
      originalDrink = recipe;
      $scope.reset();
      var parts_max = 4;
      for (var j = 0; j < originalDrink.ingredients.length; j++) {
        var parts = originalDrink.ingredients[j].parts;
        if (parts && parts > parts_max) {
          parts_max = parts;
        }
      }
      $scope.parts_max = parts_max * 1.5;
    }

    function sendOrder(user_name, order) {
      var order = angular.copy(order);
      order.user_name = user_name;
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
    }

    $scope.confirmRecipe = function(event) {
      var EnterNameController = ['$scope', '$mdDialog', function($scope,
        $mdDialog) {
        $scope.closeDialog = function() {
          console.log("closeDialog called", $scope.user_name);
          $mdDialog.hide();
        };
        $scope.cancelDialog = function() {
          $mdDialog.cancel();
        }
      }];
      $mdDialog.show({
          controller: EnterNameController,
          targetEvent: event,
          scope: $scope,
          preserveScope: true,
          templateUrl: 'drink-detail/enter-name-dialog.html',
          clickOutsideToClose: true,
        })
        .then(function(answer) {
          if (!answer) {
            console.log("got falsy answer", answer);
            return;
          }
          sendOrder($scope.user_name, $scope.selected_drink);
          console.log("Making drink ", $scope.selected_drink);
          $scope.cancel();
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

    $scope.is_modified = function() {
      return !angular.equals($scope.selected_drink, originalDrink);
    }
  }
])

.controller('NamedDrinkCtrl', ['$scope', '$http', '$controller', '$routeParams',
  function($scope, $http, $controller, $routeParams) {
    $controller('DrinkDetailCtrl', {$scope: $scope});

    // Look up the drink by name.
    var drinkName = $routeParams.drinkName;
    $http.get('/all_drinks', { cache: true }).success(function(data) {
      for (var i = 0; i < data.length; i++) {
        if (slugifyDrink(data[i].drink_name) == drinkName) {
          $scope.setRecipe(data[i]);
        }
      }
      console.log("Didn't find drink, redirecting", drinkName, data);
      $location.path('/drinks').replace();
    });
  }
])


.controller('RandomDrinkCtrl', ['$scope', '$controller', '$mdToast',
  function($scope, $controller, $mdToast) {
    $controller('DrinkDetailCtrl', {$scope: $scope});
    var name, weights;
    switch (Math.floor(Math.random() * 4)) {
      case 0:
        name = 'Random Sour';
        weights = [2, 1, 1, 0, 0];
        break;
      case 1:
        name = 'Random Spirituous';
        weights = [4, 1, 0, 1, 0];
        break;
      case 2:
        name = 'Random Bubbly Spirituous';
        weights = [4, 1, 0, 1, 1];
        break;
      case 3:
        name = 'Random Bubbly Sour';
        weights = [2, 1, 1, 0, 1];
        break;
    }
    var ingredients;
    for (var i = 0; ingredients == undefined && i < 5; i++) {
      ingredients = CreateRandomRecipe(weights);
    }
    if (!ingredients) {
      $mdToast.simple().hideDelay(5000).
        content("Oops, that didn't work. Try again");
      $location.path('/drinks');
    }
    $scope.setRecipe({'drink_name': name, 'ingredients': ingredients});
  }
]);
