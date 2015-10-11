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
  '$scope', '$http', '$mdDialog', '$location', '$timeout', '$window',
  'DrinkListStateService',
  function($scope, $http, $mdDialog, $location, $timeout, $window,
           DrinkListStateService) {
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
      $timeout(function() {
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

    $scope.$on('$routeChangeStart', function() {
      $scope.state.scrollX = $window.scrollX;
      $scope.state.scrollY = $window.scrollY;
    });

    $scope.$on('$routeChangeSuccess', function() {
      if ($scope.state.scrollX || $scope.state.scrollY) {
        $timeout(function() {
          $window.scrollTo($scope.state.scrollX, $scope.state.scrollY);
        });
      }
    });
  }
]);


