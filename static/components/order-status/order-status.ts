class OrderStatusCtrl {
  svc: OrderStatusService;

  constructor(private OrderStatusService: OrderStatusService,
              private $mdToast: ng.material.IToastService,
              private $httpParamSerializer: ng.IHttpRequestTransformer,
              private $http: ng.IHttpService) {
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
  private static COOKIE_NAME = '$orders';
  orders: Order[];
  showing: boolean;

  constructor(private $cookies: angular.cookies.ICookiesService) {
    this.showing = true;
    this.orders = this.$cookies.getObject(OrderStatusService.COOKIE_NAME) || [];
  }

  save() {
    this.$cookies.putObject(OrderStatusService.COOKIE_NAME, this.orders);
  }

  add(o: Order) {
    this.orders.push(o);
    this.save();
  }
}

angular.module('nebree8.order-status', ['ngCookies'])
  .service('OrderStatusService', OrderStatusService)
  .component('orderStatus', {
    templateUrl: 'components/order-status/order-status.html',
    controller: OrderStatusCtrl,
    controllerAs: 'ctrl',
  })
