class AllOrdersCtrl {
  pageClass = 'page-list';  // Class to apply to ng-view element.
  svc: OrderStatusService;
  
  constructor(private OrderStatusService: OrderStatusService,
              private $location: angular.ILocationService) {
    this.svc = OrderStatusService;
  };

  back() {
    this.$location.path('/drinks');
  }
}

angular.module('nebree8.all-orders', ['nebree8.order-status'])
  .config(['$routeProvider',
    function($routeProvider: angular.route.IRouteProvider) {
      $routeProvider.
      when('/all-orders', {
        templateUrl: 'all-orders/all-orders.html',
        controller: 'AllOrdersCtrl',
        controllerAs: 'ctrl',
      });
    }
  ])
  .controller('AllOrdersCtrl', AllOrdersCtrl);
