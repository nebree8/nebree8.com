class DrinkListCtrl {
  pageClass = 'page-list';  // Class to apply to ng-view element.
  state: DrinkListStateService;
  db: Recipe[][] = [];
  slugify: (name: string)=>string;

  constructor(private OrderStatusService: OrderStatusService,
              private $location: angular.ILocationService,
              private $timeout: angular.ITimeoutService,
              private $window: angular.IWindowService,
              private $mdBottomSheet: ng.material.IBottomSheetService,
              private $mdDialog: ng.material.IDialogService,
              private $mdToast: ng.material.IToastService,
              DrinkListStateService: DrinkListStateService,
              private DrinksService: DrinksService,
              private OrderDrinkService: OrderDrinkService) {
    this.state = DrinkListStateService;
    this.DrinksService.db.then((db) => {this.db = db;});
    this.slugify = DrinksService.slugifyDrinkName;
  };

  ingredientsCsv(recipe: Recipe): string {
    return this.DrinksService.ingredientsCsv(recipe);
  };

  isOrdersBtnShowing() {
    return this.OrderStatusService.orders.length > 0;
  };               

  openSearch() {
    this.state.searching = true;
    this.$timeout(function() {
      this.$window.document.getElementById('searchBox').focus();
    }.bind(this));
  };

  closeSearch() {
    this.state.searching = false;
    this.clearSearch();
  };

  clearSearch() {
    this.state.query = '';
  };

  randomDrink(event: MouseEvent) {
    var dialogPromise = this.OrderDrinkService.showOrderRandomDrinkDialog(
      event);
    dialogPromise.then((orderParams: any) => {
      return this.OrderDrinkService.sendOrder(
        orderParams.recipe, orderParams.userName);
    }).then((o: Order) => {
      this.OrderStatusService.add(o);
      this.$mdDialog.hide();
      this.$location.path('/all-orders');
    }).catch((response: ng.IHttpPromiseCallbackArg<string>) => {
      if (response) {
        this.$mdToast.show(this.$mdToast.simple().
                           content('Error: ' + response.data).
                           action("OK").hideDelay(10000));
      }
    });
  };

  gotoAllDrinks() {
    this.$location.path('/all-orders');
  }
  
  orderDrink(event: MouseEvent, recipe: Recipe) {
    var dialogPromise = this.OrderDrinkService.showOrderDrinkDialog(
      event, recipe);
    dialogPromise.then((userName: string) => {
      return this.OrderDrinkService.sendOrder(recipe, userName)
    }).then((o: Order) => {
      this.OrderStatusService.add(o);
      this.$mdDialog.hide();
      this.$location.path('/all-orders');
    }).catch((response: ng.IHttpPromiseCallbackArg<string>) => {
      this.$mdToast.show(this.$mdToast.simple().
                         content('Error: ' + response.data).
                         action("OK").hideDelay(10000));
    });
  }
}

angular.module('nebree8.drink-list',
               ['nebree8.drinks', 'nebree8.drink-list.state',
                'nebree8.order-drink'])
  .config(['$routeProvider',
    function($routeProvider: angular.route.IRouteProvider) {
      $routeProvider.
      when('/drinks', {
        templateUrl: 'drink-list/drink-list.html',
        controller: 'DrinkListCtrl',
        controllerAs: 'ctrl',
      });
    }
  ])
  .controller('DrinkListCtrl', DrinkListCtrl);
