function slugifyDrink(name) {
  return name.toLowerCase().replace(/[ ()]/g, "_").replace(/&/g, 'and');
}

var nebree8App = angular.module('nebree8App', ['ngMaterial', 'ngRoute',
  'nebree8.drink-list', 'nebree8.drink-detail'
]);

nebree8App.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      otherwise({
        redirectTo: '/drinks'
      });
  }
]);

