class AllOrdersCtrl {
  pageClass = 'all-orders';  // Class to apply to ng-view element.
  svc: OrderStatusService;
  
  constructor(private OrderStatusService: OrderStatusService,
              private $location: angular.ILocationService) {
    this.svc = OrderStatusService;
  };

  dismiss(o: Order, toDirection: string) {
    if (!o.done) {
      return;
    }
    this.svc.cancel(o);
    var card = document.querySelector('[data-order-id="' + o.id + '"]');
    card.classList.add('exit-' + toDirection);
    window.setTimeout(function() {
      card.parentNode.removeChild(card)
    }, 400);
  }
  
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
