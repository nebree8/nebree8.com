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

.controller('DrinkDetailCtrl', [
  '$scope', '$http', '$mdDialog', '$mdToast', '$routeParams', '$location',
  function($scope, $http, $mdDialog, $mdToast, $routeParams, $location) {
    var originalDrink = {};
    $scope.selected_drink = {};
    $scope.parts_modifier_max = 10;
    var parts_modifier_range = .25;  // Maximum + or - %.

    $scope.setRecipe = function(recipe) {
      originalDrink = angular.copy(recipe);
      var parts_max = 4;
      for (var j = 0; j < originalDrink.ingredients.length; j++) {
        if (originalDrink.ingredients[j].parts) {
          originalDrink.ingredients[j].parts_modifier =
              $scope.parts_modifier_max / 2;
        }
      }
      $scope.reset();
    }

    function sendOrder(user_name, order) {
      var order = angular.copy(order);
      for (var i = 0; i < order.ingredients.length; i++) {
        var ingredient = order.ingredients[i];
        var mod = ingredient.parts_modifier;
        delete ingredient.parts_modifier
        if (mod != undefined) {
          var coef = mod / $scope.parts_modifier_max * 2 * parts_modifier_range;
          ingredient.parts *= 1 - parts_modifier_range + coef;
        }
      }
      order.user_name = user_name;
      console.log("Order", order);
      $scope.drink_id = 'unknown';
      return $http({
        'method': 'POST',
        'url': '/api/order',
        'params': {
          'recipe': order,
        },
        'responseType': 'json'
      }).then(function(response) {
        console.log("response from /api/order", response)
        $scope.drink_id = response.data.id;
        return response;
      })
    }

    $scope.confirmRecipe = function(event) {
      var EnterNameController = ['$mdDialog', function($mdDialog, userName) {
        this.userName = userName;
        this.closeDialog = function() {
          console.log("closeDialog called", this.userName, this.nameForm);
          if (this.nameForm.$valid) {
            $mdDialog.hide(this.userName);
          }
        }
        this.cancelDialog = function() {
          $mdDialog.cancel();
        }
      }];
      $mdDialog.show({
          controller: EnterNameController,
          targetEvent: event,
          preserveScope: true,
          templateUrl: 'drink-detail/enter-name-dialog.html',
          clickOutsideToClose: true,
          controllerAs: 'ctrl',
          locals: {'userName': this.user_name},
        })
        .then(function(answer) {
          if (!answer) {
            console.log("got falsy answer", answer);
            return;
          }
          $scope.user_name = answer;
          sendOrder($scope.user_name, $scope.selected_drink).then(
            function(response) {
              $scope.cancel();
              $mdToast.show($mdToast.simple().hideDelay(10000).content(
                    $scope.selected_drink.drink_name + ' ordered'));
            },
            function(response) {
              console.log("response", response);
              $mdToast.show($mdToast.simple().
                  content('Error: ' + response.data).
                  action("OK").hideDelay(10000));
            });
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

.controller('NamedDrinkCtrl', [
  '$scope', '$http', '$controller', '$routeParams', '$location',
  function($scope, $http, $controller, $routeParams, $location) {
    $controller('DrinkDetailCtrl', {$scope: $scope});

    // Look up the drink by name.
    var drinkName = $routeParams.drinkName;
    $http.get('/all_drinks', { cache: true }).success(function(data) {
      for (var i = 0; i < data.length; i++) {
        if (slugifyDrink(data[i].drink_name) == drinkName) {
          $scope.setRecipe(data[i]);
          return;
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
