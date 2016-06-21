class AboutCtrl {
  pageClass = 'page-about';
  hideOrderStatus = true;
}

angular.module('nebree8.about', [])
  .config(['$routeProvider',
    function($routeProvider: angular.route.IRouteProvider) {
      $routeProvider.when('/about', {
        templateUrl: 'about/about.html',
        controller: 'AboutCtrl'
        controllerAs: 'ctrl',
      });
    }
  ])
  .controller('AboutCtrl', AboutCtrl);
