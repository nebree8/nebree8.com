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
    console.log("DrinkAppCtrl constructor");
    $scope.searching = false;
    $scope.query = '';
    $scope.selected_drink = null;
    $scope.user_name = '';

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
      console.log("select", drink);
      $scope.selected_drink = angular.copy(drink);
      $location.path('/drinks/' + slugifyDrink(drink.drink_name));
    }
  }
]);


