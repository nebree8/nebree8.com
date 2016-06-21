class AboutCtrl {
  pageClass = 'page-about';
  hideOrderStatus = true;
  orderStatusService: OrderStatusService;

  constructor(private OrderStatusService: OrderStatusService,
              private $scope: angular.IScope) {
    this.orderStatusService = OrderStatusService;
    $scope.$on('$viewContentLoaded', () => {
      this.orderStatusService.showing = false;
    });
  }
}

angular.module('nebree8.about', ['nebree8.order-status'])
  .config(['$routeProvider',
    function($routeProvider: angular.route.IRouteProvider) {
      $routeProvider.when('/about', {
        templateUrl: 'about/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'ctrl',
      });
    }
  ])
  .controller('AboutCtrl', AboutCtrl);
