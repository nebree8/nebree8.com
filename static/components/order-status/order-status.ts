class OrderStatusCtrl {
  svc: OrderStatusService;

  constructor(private OrderStatusService: OrderStatusService,
              private $mdToast: ng.material.IToastService,
              private $httpParamSerializer: ng.IHttpRequestTransformer,
              private $http: ng.IHttpService) {
    console.log("OrderStatusCtrl");
    this.svc = OrderStatusService;
  }

  ingredientsCsv(order: Order): string {
    var names: string[] = [];
    for (var i = 0; i < order.ingredients.length; i++) {
      names.push(order.ingredients[i].name);
    }
    return names.join(", ");
  }

  rate(o: Order, i: number) {
    console.log("Rate", o, i);
    o.rating = i;
    this.$http({
      method: 'POST',
      url: '/api/order_rate',
      data: {'rating': o.rating, 'key': o.id},
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      transformRequest: this.$httpParamSerializer,
    }).then(
      () => this.$mdToast.showSimple("Rating saved!"),
      () => {
        this.$mdToast.showSimple(
            "Your rating was not saved. Please try again.");
        o.rating = 0;
    });
  }
}

class OrderStatusService {
  orders: Order[] = [];

  constructor() {
    console.log("OrderStatusService");
  }
}

angular.module('nebree8.order-status', [])
  .service('OrderStatusService', OrderStatusService)
  .component('orderStatus', {
    templateUrl: 'components/order-status/order-status.html',
    controller: OrderStatusCtrl,
    controllerAs: 'ctrl',
  })
