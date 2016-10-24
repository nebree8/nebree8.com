class OrderDrinkService {

  constructor(private $http: angular.IHttpService,
              private $mdDialog: ng.material.IDialogService) {}

  showOrderDrinkDialog(event: MouseEvent, recipe: Recipe) {
    return this.$mdDialog.show(<ng.material.IDialogOptions>{
      controller: 'OrderDrinkDialogCtrl',
      controllerAs: 'ctrl',
      locals: {
        recipe: recipe
      },
      bindToController: true,
      clickOutsideToClose: false,
      escapeToClose: false,
      hasBackdrop: true,
      targetEvent: event,
      templateUrl: 'components/order-drink/order-drink-dialog.html',
    });
  };

  showOrderRandomDrinkDialog(event: MouseEvent) {
    return this.$mdDialog.show(<ng.material.IDialogOptions>{
      controller: 'OrderRandomDrinkDialogCtrl',
      controllerAs: 'ctrl',
      bindToController: true,
      clickOutsideToClose: false,
      escapeToClose: false,
      hasBackdrop: true,
      targetEvent: event,
      templateUrl: 'components/order-drink/order-random-drink-dialog.html',
    });
  };

  sendOrder(recipe: Recipe, userName: string): angular.IPromise<Order> {
    var order: Order = angular.copy(recipe);
    order.user_name = userName;
    return this.$http.post('/api/order', order, {
      'responseType': 'json'
    }).then((r: angular.IHttpPromiseCallbackArg<OrderDrinkResponse>) => {
      console.log('server response', r);
      order.id = r.data.id;
      return order;
    });
  };
}

angular.module('nebree8.order-drink')
  .service('OrderDrinkService', OrderDrinkService);
