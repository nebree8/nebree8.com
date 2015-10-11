angular.module('nebree8.drink-list', [])

.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/drinks', {
        templateUrl: 'drink-list/drink-list.html',
        controller: 'DrinkListCtrl',
      });
  }
])

.factory('DrinkListStateService', [function() {
  var service = {};
  service.searching = false;
  service.query = '';
  return service;
}])

.controller('DrinkListCtrl', [
  '$scope', '$http', '$mdDialog', '$location', 'DrinkListStateService',
  function($scope, $http, $mdDialog, $location, DrinkListStateService) {
    $scope.state = DrinkListStateService;

    $http.get('/all_drinks', { cache: true }).success(function(data) {
      $scope.db = data;
    });

    $scope.slugify = slugifyDrink;

    $scope.ingredientsCsv = function(drink) {
      var names = [];
      for (var i = 0; i < drink.ingredients.length; i++) {
        names.push(drink.ingredients[i].name);
      }
      return names.join(", ");
    }
    $scope.selectDrink = function(drink) {
      $location.path('/drinks/' + slugifyDrink(drink.drink_name));
    }

    $scope.openSearch = function() {
      $scope.state.searching = true;
      window.setTimeout(function() {
        document.getElementById('searchBox').focus()
      });
    }

    $scope.closeSearch = function() {
      $scope.state.searching = false;
      $scope.clearSearch();
    }

    $scope.clearSearch = function() { $scope.state.query = '' }

    $scope.randomDrink = function(drink) {
      $location.path('/drinks/random');
    }
  }
]);


