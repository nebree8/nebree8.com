angular.module('nebree8App', [
    'ngMaterial', 'ngRoute', 'nebree8.drink-detail', 'nebree8.drink-list'
  ])
  .config(['$routeProvider',
    function($routeProvider) {
      $routeProvider.
      otherwise({
        redirectTo: '/drinks'
      });
    }
  ]);
