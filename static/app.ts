angular.module('nebree8App', [
    'ngMaterial', 'ngRoute', 'nebree8.drink-detail', 'nebree8.drink-list',
    'nebree8.save-scroll',
  ])
  .config(['$routeProvider',
    function($routeProvider: ng.route.IRouteProvider) {
      $routeProvider.
      otherwise({
        redirectTo: '/drinks'
      });
    }
  ]);
