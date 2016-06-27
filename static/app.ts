angular.module('nebree8App', [
  'ngMaterial', 'ngRoute', 'nebree8.about', 'nebree8.drink-detail',
  'nebree8.drink-list', 'nebree8.save-scroll', 'nebree8.order-status',
  'nebree8.order-status-sheet',
  ])
  .config(['$routeProvider',
    function($routeProvider: ng.route.IRouteProvider) {
      $routeProvider.otherwise({
        redirectTo: '/drinks'
      });
    }
  ]);
