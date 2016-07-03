class OrderStatusCtrl {
  svc: OrderStatusService;
  order: Order;
  showAllOrders: boolean;
  status_interval: angular.IPromise<any>;
  order_status: OrderStatusResponse;

  constructor(private OrderStatusService: OrderStatusService,
              private $location: angular.ILocationService,
              private $interval: angular.IIntervalService,
              private $mdToast: ng.material.IToastService,
              private $mdBottomSheet: ng.material.IBottomSheetService,
              private $httpParamSerializer: ng.IHttpRequestTransformer,
              private $http: ng.IHttpService,
              private $mdDialog: ng.material.IDialogService) {
    this.svc = OrderStatusService;
    this.updateOrderStatus();
    this.status_interval = this.$interval(
      angular.bind(this, this.updateOrderStatus), 4000);
  }

  updateOrderStatus() {
    this.$http({
      method: 'POST',
      url: '/api/order_status',
      data: { 'key': this.order.id },
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      transformRequest: this.$httpParamSerializer,
    }).then((response: ng.IHttpPromiseCallbackArg<OrderStatusResponse>) => {
      this.order_status = response.data;
      if (this.order_status.done) {
        this.$interval.cancel(this.status_interval);
        this.order.done = true;
      }
    });
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
      () => {
        this.$mdToast.showSimple("Rating saved! Swipe to dismiss.");
        this.svc.save();
      },
      () => {
        this.$mdToast.showSimple(
            "Your rating was not saved. Please try again.");
        this.order.rating = 0;
    });
  }

  queuePosAsOrdinal(): any {
    if (!this.order_status) {
      return '';
    }

    var suffix = function(n: number) {
      return Math.floor(n / 10) === 1
        ? 'th'
        : (n % 10 === 1
           ? 'st'
           : (n % 10 === 2
              ? 'nd'
              : (n % 10 === 3
                 ? 'rd'
                 : 'th')));
    };
    var q = this.order_status.queue_position;
    return { q: q, suffix: suffix(q) };
  }

  orderCanCancel() {
    return (this.order_status &&
            !this.order_status.done &&
            this.order_status.progress_percent == 0);
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
      order: '=',
      showAllOrders: '<',
    }
  })
