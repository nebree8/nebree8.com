class DrinkListCtrl {
  pageClass = 'page-list';  // Class to apply to ng-view element.
  state: DrinkListStateService;
  db: Recipe[] = [];
  slugify: (string)=>string;

  constructor(private $scope: angular.IScope,
              private $location: angular.ILocationService,
              private $timeout: angular.ITimeoutService,
              private $window: angular.IWindowService,
              DrinkListStateService: DrinkListStateService,
              DrinksService: DrinksService) {
    this.state = DrinkListStateService;
    DrinksService.db.then((db) => {this.db = db;});
    this.slugify = DrinksService.slugifyDrinkName;

    $scope.$on('$routeChangeStart', function() {
      this.state.scrollX = $window.scrollX;
      this.state.scrollY = $window.scrollY;
    }.bind(this));

    $scope.$on('$routeChangeSuccess', function() {
      if (this.state.scrollX || this.state.scrollY) {
        $timeout(function() {
          $window.scrollTo(this.state.scrollX, this.state.scrollY);
        }.bind(this));
      }
    }.bind(this));
  };

  ingredientsCsv(drink: Recipe): string {
    var names = [];
    for (var i = 0; i < drink.ingredients.length; i++) {
      names.push(drink.ingredients[i].name);
    }
    return names.join(", ");
  };

  selectDrink(drink: Recipe) {
    this.$location.path('/drinks/' + this.slugify(drink.drink_name));
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
