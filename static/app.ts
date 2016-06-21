class TopCtrl {
  orderStatusService: OrderStatusService;

  constructor(private OrderStatusService: OrderStatusService) {
    this.orderStatusService = OrderStatusService;
  }

  isStatusShowing(): boolean {
    return this.orderStatusService.showing;
  }
}

angular.module('nebree8App', [
    'ngMaterial', 'ngRoute', 'nebree8.about', 'nebree8.drink-detail', 'nebree8.drink-list',
    'nebree8.save-scroll', 'nebree8.order-status',
  ])
  .config(['$routeProvider',
    function($routeProvider: ng.route.IRouteProvider) {
      $routeProvider.otherwise({
        redirectTo: '/drinks'
      });
    }
  ])
  .controller('TopCtrl', TopCtrl);
