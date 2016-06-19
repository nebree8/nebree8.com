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
  private static COOKIE_NAME = 'orders';
  orders: Order[];

  constructor(private $cookies: any) {
    console.log("OrderStatusService");
    this.load();
  }

  add(o: Order) {
    this.orders.push(o);
    this.save();
  }

  save() {
    this.$cookies.put(OrderStatusService.COOKIE_NAME, this.orders);
  }

  load() {
    this.orders = this.$cookies.get(OrderStatusService.COOKIE_NAME) || [];
    console.log(this.orders);
    if (!Array.isArray(this.orders)) {
      console.log("Got junk when loading orders: ", this.orders)
      this.orders = [];
    }
  }
}

angular.module('nebree8.order-status', ['ngCookies', 'ngTouch'])
  .service('OrderStatusService', OrderStatusService)
  .component('orderStatus', {
    templateUrl: 'components/order-status/order-status.html',
    controller: OrderStatusCtrl,
    controllerAs: 'ctrl',
  })
