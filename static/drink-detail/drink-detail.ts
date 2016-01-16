class DrinkDetailCtrl {
  originalDrink: Recipe = null;
  selectedDrink: Recipe = null;
  partsModifiers: Array<number> = [];

  // constants.
  pageClass = 'page-detail';
  partsModifierMax = 10;
  partsModifierRange = 0.25;

  constructor(private $http: angular.IHttpService,
              private $location: angular.ILocationService,
              private $mdDialog: angular.material.IDialogService,
              private $mdToast: angular.material.IToastService,
              private EnterNameDialogService: EnterNameDialogService) {
  };

  setRecipe(recipe: Recipe) {
    this.originalDrink = angular.copy(recipe);
    this.reset();
  };

  private sendOrder(userName: string): angular.IHttpPromise<OrderDrinkResponse> {
    var order: Order = angular.copy(this.selectedDrink);
    var i, ingredient, mod, coef;
    for (i = 0; i < order.ingredients.length; i++) {
      ingredient = order.ingredients[i];
      mod = this.partsModifiers[i];
      if (mod !== undefined) {
        coef = mod / this.partsModifierMax * 2 * this.partsModifierRange;
        ingredient.parts *= 1 - this.partsModifierRange + coef;
      }
    }
    order.user_name = userName;
    console.log("Order", order);
    return this.$http.post('/api/order', order, {
      'responseType': 'json'
    });
  };

  /**
   * @param {Event} event
   */
  confirmRecipe(event: MouseEvent) {
    this.EnterNameDialogService.getUserName(event)
        .then(this.confirmName.bind(this))
        .catch(() => { console.log("Dialog cancelled"); });
  };

  private confirmName(userName: string) {
    if (!userName) return;
    console.log("confirmName this", this);
    this.sendOrder(userName)
        .then(() => {
          this.cancel();
          this.$mdToast.show(this.$mdToast.simple().hideDelay(10000).content(
            this.selectedDrink.drink_name + ' ordered'));
        })
        .catch((response: ng.IHttpPromiseCallbackArg<string>) => {
          this.$mdToast.show(this.$mdToast.simple().
                             content('Error: ' + response.data).
                             action("OK").hideDelay(10000));
        });
  }

  cancel() {
    this.$location.path("/drinks");
  };

  reset() {
    this.selectedDrink = angular.copy(this.originalDrink);
    this.partsModifiers = [];
    for (var j = 0; j < this.originalDrink.ingredients.length; j++) {
      if (this.originalDrink.ingredients[j].parts) {
        this.partsModifiers[j] = this.partsModifierMax / 2;
      }
    }
  };

  is_modified(): boolean {
    return !angular.equals(this.selectedDrink, this.originalDrink);
  };
}

// Loads the drink specified in the URL by name.
//
// A subclass of DrinkDetailCtrl, but written in classic JS style to allow an
// indirect call to super() with dependency injection.
var NamedDrinkCtrl = function($scope: ng.IScope,
                              $injector: ng.auto.IInjectorService,
                              $routeParams: ng.route.IRouteParamsService,
                              $location: ng.ILocationService, DrinksService) {
  $injector.invoke(DrinkDetailCtrl, this);

  /** @type {string} */
  var drinkName = $routeParams['drinkName'];

  // Look up the drink by name.
  DrinksService.getDrink(drinkName).then((recipe)=>{
    this.setRecipe(recipe);
  }).catch((reason) => {
    console.log("Didn't find drink, redirecting", drinkName);
    DrinksService.db.then((db)=>{console.log("db", db);});
    $location.path('/drinks').replace();
  });
};
NamedDrinkCtrl.prototype = DrinkDetailCtrl.prototype;

// Generates a random recipe and shows a detail page for it.
//
// A subclass of DrinkDetailCtrl, but written in classic JS style to allow an
// indirect call to super() with dependency injection.
var RandomDrinkCtrl = function($scope: ng.IScope,
                               $q: ng.IQService,
                               $injector: ng.auto.IInjectorService,
                               $location: ng.ILocationService,
                               $mdToast: ng.material.IToastService,
                               RandomDrinkService: RandomDrinkService,
                               DrinksService: DrinksService) {
  $injector.invoke(DrinkDetailCtrl, this);

  var name: string;
  var weights: number[];
  switch (Math.floor(Math.random() * 4)) {
    case 0:
      name = 'Random Sour';
      weights = [2, 1, 1, 0, 0];
      break;
    case 1:
      name = 'Random Spirituous';
      weights = [4, 1, 0, 1, 0];
      break;
    case 2:
      name = 'Random Bubbly Spirituous';
      weights = [4, 1, 0, 1, 1];
      break;
    case 3:
      name = 'Random Bubbly Sour';
      weights = [2, 1, 1, 0, 1];
      break;
  }
  RandomDrinkService.createDrink(name, weights).then((recipe) => {
    this.setRecipe(recipe);
  }).catch((error) => {
    $mdToast.simple().hideDelay(5000).
      content("Oops, that didn't work. Try again");
    $location.path('/drinks');
  })
};
RandomDrinkCtrl.prototype = DrinkDetailCtrl.prototype;


angular.module('nebree8.drink-detail',
               ['nebree8.random-drink', 'nebree8.drinks',
                 'nebree8.enter-name-dialog'])
    .config(['$routeProvider',
      function($routeProvider: ng.route.IRouteProvider) {
        $routeProvider.
          when('/drinks/random', {
            templateUrl: 'drink-detail/drink-detail.html',
            controller: 'RandomDrinkCtrl',
            controllerAs: 'ctrl',
          }).
          when('/drinks/:drinkName', {
            templateUrl: 'drink-detail/drink-detail.html',
            controller: 'NamedDrinkCtrl',
            controllerAs: 'ctrl',
          });
      }
    ])
    .controller('DrinkDetailCtrl', DrinkDetailCtrl)
    .controller('NamedDrinkCtrl', NamedDrinkCtrl)
    .controller('RandomDrinkCtrl', RandomDrinkCtrl);
