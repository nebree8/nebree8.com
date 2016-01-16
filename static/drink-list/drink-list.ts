/**
 * @constructor
 * @ngInject
 * @struct
 *
 * @param {angular.Scope} $scope
 * @param {angular.$location} $location
 * @param {angular.$timeout} $timeout
 * @param {Window} $window
 * @param {DrinkListStateService} DrinkListStateService
 * @param {DrinksService} DrinksService
 */
var DrinkListCtrl = function($scope, $location, $timeout, $window,
    DrinkListStateService, DrinksService) {
  this.$scope = $scope;
  this.$location = $location;
  this.$timeout = $timeout;
  this.$window = $window;

  /** @export {DrinkListStateService} */
  this.state = DrinkListStateService;
  /** @export {Array<nebree8.Recipe>} */
  this.db = DrinksService.db;
  /** @export {function(string)} */
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

/**
 * Class to apply to the ng-view element.
 * @export {string}
 */
DrinkListCtrl.prototype.pageClass = 'page-list';

/**
 * @param {nebree8.Recipe} drink
 * @export
 */
DrinkListCtrl.prototype.ingredientsCsv = function(drink) {
  var names = [];
  for (var i = 0; i < drink.ingredients.length; i++) {
    names.push(drink.ingredients[i].name);
  }
  return names.join(", ");
};

/**
 * @param {nebree8.Recipe} drink
 * @export
 */
DrinkListCtrl.prototype.selectDrink = function(drink) {
  this.$location.path('/drinks/' + this.slugify(drink.drink_name));
};

/** @export */
DrinkListCtrl.prototype.openSearch = function() {
  this.state.searching = true;
  this.$timeout(function() {
    this.$window.document.getElementById('searchBox').focus();
  }.bind(this));
};

/** @export */
DrinkListCtrl.prototype.closeSearch = function() {
  this.state.searching = false;
  this.clearSearch();
};

/** @export */
DrinkListCtrl.prototype.clearSearch = function() {
  this.state.query = '';
};

/** @export */
DrinkListCtrl.prototype.randomDrink = function() {
  this.$location.path('/drinks/random');
};

angular.module('nebree8.drink-list',
               ['nebree8.drinks', 'nebree8.drink-list.state'])
  .config(['$routeProvider',
    function($routeProvider) {
      $routeProvider.
      when('/drinks', {
        templateUrl: 'drink-list/drink-list.html',
        controller: 'DrinkListCtrl',
        controllerAs: 'ctrl',
      });
    }
  ])
  .controller('DrinkListCtrl', DrinkListCtrl);
