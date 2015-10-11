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

.controller('DrinkListCtrl', ['$scope', '$http', '$mdDialog', '$location',
  function($scope, $http, $mdDialog, $location) {
    $scope.searching = false;
    $scope.query = '';

    $http.get('/all_drinks', { cache: true }).success(function(data) {
      $scope.db = data;
    });
    $scope.drinkUrl = slugifyDrink;
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

    $scope.toggleSearch = function(state) {
      $scope.searching = state;
    }
  }
]);


