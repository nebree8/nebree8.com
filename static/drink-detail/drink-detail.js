/*global angular */
angular.module('nebree8.drink-detail', ['nebree8.random-drink', 'nebree8.drinks'])

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
    $scope.pageClass = 'page-detail';
    $scope.selected_drink = {};
    $scope.parts_modifier_max = 10;
    var parts_modifier_range = 0.25;  // Maximum + or - %.

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
  '$scope', '$controller', '$routeParams', '$location', 'DrinksService',
  function($scope, $controller, $routeParams, $location, DrinksService) {
    $controller('DrinkDetailCtrl', {$scope: $scope});

    // Look up the drink by name.
    $scope.$watch(DrinksService.ready, function(value) {
      if (!value) return;

      var recipe = DrinksService.getDrink($routeParams.drinkName);
      if (recipe) {
        $scope.setRecipe(recipe);
      } else {
        console.log("Didn't find drink, redirecting", $routeParams.drinkName,
                    DrinksService.db);
        $location.path('/drinks').replace();
      };
    });
  }
])

.controller('RandomDrinkCtrl', [
    '$scope', '$controller', '$location', '$mdToast', 'RandomDrink', 'DrinksService',
  function($scope, $controller, $location, $mdToast, RandomDrink, DrinksService) {
    $controller('DrinkDetailCtrl', {$scope: $scope});

    $scope.$watch(DrinksService.ready, function(ready) {
      if (!ready) return;
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
      var recipe;
      for (var i = 0; recipe == undefined && i < 5; i++) {
        recipe = RandomDrink.createDrink(name, weights);
      }
      if (!recipe) {
        $mdToast.simple().hideDelay(5000).
          content("Oops, that didn't work. Try again");
        $location.path('/drinks');
        return;
      }
      $scope.setRecipe(recipe);
    });
  }
]);
