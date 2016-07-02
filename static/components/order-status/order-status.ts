class OrderStatusCtrl {
  svc: OrderStatusService;
  order: Order;
  showAllOrders: boolean;

  constructor(private OrderStatusService: OrderStatusService,
              private $location: angular.ILocationService,
              private $mdToast: ng.material.IToastService,
              private $mdBottomSheet: ng.material.IBottomSheetService,
              private $httpParamSerializer: ng.IHttpRequestTransformer,
              private $http: ng.IHttpService,
              private $mdDialog: ng.material.IDialogService) {
    this.svc = OrderStatusService;
  }

  cancelOrder(event: MouseEvent) {
    var confirm = this.$mdDialog.confirm()
      .title('Confirm drink cancellation')
      .content('Are you sure you want to cancel this drink order?')
      .targetEvent(event)
      .ok('Cancel order')
      .cancel('Keep order');
    this.$mdDialog.show(confirm).then(() => {
      this.$http({
        method: 'POST',
        url: '/api/cancel_drink',
        data: { 'key': this.order.id },
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        transformRequest: this.$httpParamSerializer,
      }).then(
        () => {
          this.$mdDialog.hide();
          var simple = this.$mdToast.simple()
            .content('Order cancelled!')
            .parent(document.querySelector('.list-content'))
            .position('top');
          this.$mdToast.show(simple);
          this.svc.cancel(this.order);
          if (this.svc.orders.length <= 0) {
            this.$mdBottomSheet.hide();
          }
        },
        () => {
          this.$mdToast.showSimple(
            'Your order could not be cancelled. Please try again.');
        });
    });
  }

  allOrders() {
    this.$mdBottomSheet.hide();
    this.$location.path('/all-orders');
  }
  
  rate(i: number) {
    this.order.rating = i;
    this.$http({
      method: 'POST',
      url: '/api/order_rate',
      data: {
        'rating': this.order.rating,
        'key': this.order.id
      },
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      transformRequest: this.$httpParamSerializer,
    }).then(
      () => this.$mdToast.showSimple("Rating saved!"),
      () => {
        this.$mdToast.showSimple(
            "Your rating was not saved. Please try again.");
        this.order.rating = 0;
    });
  }
}

class OrderStatusService {
  private static COOKIE_NAME = '$orders';
  orders: Order[];
  showing: boolean;

  constructor(private $cookies: angular.cookies.ICookiesService,
              private $http: ng.IHttpService,
              private $httpParamSerializer: ng.IHttpRequestTransformer) {
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

  cancel(o: Order) {
    for(var i=0; i < this.orders.length; i++) {
      var order = this.orders[i];
      if (order.id == o.id) {
        this.orders.splice(i, 1);
        break;
      }
    }
    this.save();
  }
}

angular.module('nebree8.order-status', ['ngCookies'])
  .service('OrderStatusService', OrderStatusService)
  .component('orderStatus', {
    templateUrl: 'components/order-status/order-status.html',
    controller: OrderStatusCtrl,
    controllerAs: 'ctrl',
    bindings: {
      order: '<',
      showAllOrders: '<',
    }
  })
