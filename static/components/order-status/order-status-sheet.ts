class OrderStatusSheetCtrl {
  svc: OrderStatusService;

  constructor(OrderStatusService: OrderStatusService) {
    this.svc = OrderStatusService;
  }
}

angular.module('nebree8.order-status-sheet', ['nebree8.order-status'])
  .controller('OrderStatusSheetCtrl', OrderStatusSheetCtrl);
