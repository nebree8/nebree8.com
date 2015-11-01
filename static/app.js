/*global angular */
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

