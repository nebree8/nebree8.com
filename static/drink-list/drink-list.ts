class DrinkListCtrl {
  pageClass = 'page-list';  // Class to apply to ng-view element.
  state: DrinkListStateService;
  db: Recipe[] = [];
  slugify: (name: string)=>string;

  constructor(private OrderStatusService: OrderStatusService,
              private $location: angular.ILocationService,
              private $timeout: angular.ITimeoutService,
              private $window: angular.IWindowService,
              DrinkListStateService: DrinkListStateService,
              DrinksService: DrinksService,
              private $mdBottomSheet: ng.material.IBottomSheetService) {
    this.state = DrinkListStateService;
    this.showOrderStatusSheet();
    DrinksService.db.then((db) => {this.db = db;});
    this.slugify = DrinksService.slugifyDrinkName;
  };

  ingredientsCsv(drink: Recipe): string {
    var names: string[] = [];
    for (var i = 0; i < drink.ingredients.length; i++) {
      names.push(drink.ingredients[i].name);
    }
    return names.join(", ");
  };

  selectDrink(drink: Recipe) {
    this.$location.path('/drinks/' + this.slugify(drink.drink_name));
  };

  isOrdersBtnShowing() {
    return (!this.state.viewingOrders &&
            this.OrderStatusService.orders.length > 0);
  };
  
  showOrderStatusSheet() {
    if (this.OrderStatusService.orders.length <= 0) {
      return;
    }

    var setState = () => {
      this.state.viewingOrders = false;
    }
    
    this.$mdBottomSheet.show(<angular.material.IBottomSheetOptions>{
      controller: 'OrderStatusSheetCtrl',
      templateUrl: 'components/order-status/order-status-sheet.html'
    }).then(setState, setState);
    this.state.viewingOrders = true;
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

  randomDrink() {
    this.$location.path('/drinks/random');
  };
}

angular.module('nebree8.drink-list',
               ['nebree8.drinks', 'nebree8.drink-list.state'])
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
