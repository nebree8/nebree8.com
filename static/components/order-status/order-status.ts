class OrderStatusCtrl {
  svc: OrderStatusService;
  order: Order;
  index: number;

  constructor(private OrderStatusService: OrderStatusService,
              private $mdToast: ng.material.IToastService,
              private $mdBottomSheet: ng.material.IBottomSheetService,
              private $httpParamSerializer: ng.IHttpRequestTransformer,
              private $http: ng.IHttpService,
              private $mdDialog: ng.material.IDialogService) {
    this.svc = OrderStatusService;
  }

  currentOrder(): Order {
    return this.svc.orders[this.svc.orders.length - 1];
  }
  
  cancelOrder(event) {
    var confirm = this.$mdDialog.confirm({
      title: 'Confirm drink cancellation',
      content: 'Are you sure you want to cancel this drink order?',
      ok: 'Cancel order',
      cancel: 'Keep order',
    })
    this.$mdDialog.show(confirm).then(() => {
      this.$http({
        method: 'POST',
        url: '/api/cancel_drink',
        data: { 'key': this.currentOrder().id },
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        transformRequest: this.$httpParamSerializer,
      }).then(
        () => {
          this.$mdDialog.hide();
          var simple = this.$mdToast.simple({
            content: 'Order cancelled!',
            parent: document.querySelector('.list-content'),
            position: 'top',
          });
          this.$mdToast.show(simple);
          this.svc.cancel(this.currentOrder());
          if (this.svc.orders.length <= 0) {
            this.$mdBottomSheet.hide();
          }
        },
        () => {
          this.$mdToast.showSimple(
            "Your order could not be cancelled. Please try again.");
        });
    });
  }
  
  rate(i: number) {
    this.currentOrder().rating = i;
    this.$http({
      method: 'POST',
      url: '/api/order_rate',
      data: {
        'rating': this.currentOrder().rating,
        'key': this.currentOrder().id
      },
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      transformRequest: this.$httpParamSerializer,
    }).then(
      () => this.$mdToast.showSimple("Rating saved!"),
      () => {
        this.$mdToast.showSimple(
            "Your rating was not saved. Please try again.");
        this.currentOrder().rating = 0;
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
      orders: '<',
      index: '<',
      showMore: '<',
    }
  })
