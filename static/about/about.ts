angular.module('nebree8.about', [])
  .config(['$routeProvider',
    function($routeProvider: angular.route.IRouteProvider) {
      $routeProvider.when('/about', {
        templateUrl: 'about/about.html',
      });
    }
  ]);
