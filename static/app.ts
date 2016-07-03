angular.module('nebree8App', [
  'ngMaterial', 'ngRoute', 'nebree8.about',  'nebree8.drink-list',
  'nebree8.save-scroll', 'nebree8.order-status',  'nebree8.all-orders',
  'nebree8.order-drink',
  ])
  .config(['$routeProvider',
    function($routeProvider: ng.route.IRouteProvider) {
      $routeProvider.otherwise({
        redirectTo: '/drinks'
      });
    }
  ]);
