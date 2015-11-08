/*global angular */
"use strict";

/**
 * Drink detail base controller.
 *
 * @constructor
 * @struct
 * @ngInject
 * @param {angular.$http} $http
 * @param {angular.$location} $location
 * @param {md.$dialog} $mdDialog
 * @param {md.$toast} $mdToast
 */
var DrinkDetailCtrl = function($http, $location, $mdDialog, $mdToast) {
  /** @type {angular.$http} */
  this.$http = $http;
  /** @type {angular.$location} */
  this.$location = $location;
  /** @type {md.$dialog} */
  this.$mdDialog = $mdDialog;
  /** @type {md.$toast} */
  this.$mdToast = $mdToast;

  /** @type {nebree8.Recipe} */
  this.originalDrink = null;
  /** @export {nebree8.Recipe} */
  this.selectedDrink = null;
  /** @export {Array<number>} */
  this.partsModifiers = [];

  /** Maximum discrete value to use for sliders.
   * @export {number}
   * @const
   */
  this.partsModifierMax = 10;

  /**
   * @type {number}
   * @const
   */
  this.partsModifierRange = 0.25;  // Maximum + or - %.
  console.log("DrinkDetailCtrl", this);
};

/**
 * @export
 * @type {string}
 */
DrinkDetailCtrl.prototype.pageClass = 'page-detail';

/**
 * @param {nebree8.Recipe} recipe
 */
DrinkDetailCtrl.prototype.setRecipe = function(recipe) {
  this.originalDrink = angular.copy(recipe);
  this.reset();
};

/**
 * @private
 * @param {string} userName
 * @returns {angular.$q.Promise<angular.$http.Response>}
 */
DrinkDetailCtrl.prototype.sendOrder = function(userName) {
  var order = angular.copy(this.selectedDrink);
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
  }).then(function(response) {
    console.log("response from /api/order", response);
    return response;
  });
};

/**
 * @export
 * @param {Event} event
 */
DrinkDetailCtrl.prototype.confirmRecipe = function(event) {
  /**
   * @param {md.$dialog} $mdDialog
   * @constructor
   * @ngInject
   * @struct
   */
  var EnterNameController = function($mdDialog) {
    /**
     * @export
     * @type {angular.FormController}
     */
    this.nameForm = null;
    /** @export {string} */
    this.userName = "";
    /** @export */
    this.closeDialog = function() {
      if (this.nameForm.$valid) {
        $mdDialog.hide(this.userName);
      }
    };
    /** @export */
    this.cancelDialog = function() {
      $mdDialog.cancel();
    };
  };
  this.$mdDialog.show({
    clickOutsideToClose: true,
    controller: EnterNameController,
    controllerAs: 'ctrl',
    escapeToClose: true,
    hasBackDrop: true,
    targetEvent: event,
    templateUrl: 'drink-detail/enter-name-dialog.html',
  })
  .then(function(userName) {
    if (!userName) {
      console.log("got falsy answer", userName);
      return;
    }
    this.sendOrder(userName).then(
        function() {
          this.cancel();
          this.$mdToast.show(this.$mdToast.simple().hideDelay(10000).content(
                this.selectedDrink.drink_name + ' ordered'));
        }.bind(this),
        function(response) {
          console.log("response", response);
          this.$mdToast.show(this.$mdToast.simple().
              content('Error: ' + response.data).
              action("OK").hideDelay(10000));
        }.bind(this));
  }.bind(this), function() {
    console.log("dialog cancelled");
  }.bind(this));
};

/** @export */
DrinkDetailCtrl.prototype.cancel = function() {
  this.$location.path("/drinks");
};

/** @export */
DrinkDetailCtrl.prototype.reset = function() {
  var j;
  this.selectedDrink = angular.copy(this.originalDrink);
  this.partsModifiers = [];
  for (j = 0; j < this.originalDrink.ingredients.length; j++) {
    if (this.originalDrink.ingredients[j].parts) {
      this.partsModifiers[j] = this.partsModifierMax / 2;
    }
  }
};

/**
 * @export
 * @return {boolean}
 */
DrinkDetailCtrl.prototype.is_modified = function() {
  return !angular.equals(this.selectedDrink, this.originalDrink);
};

/**
 * Loads the drink specified in the URL by name.
 *
 * @param {angular.Scope} $scope
 * @param {angular.$injector} $injector
 * @param {angular.$routeParams} $routeParams
 * @param {angular.$location} $location
 * @param {DrinksService} DrinksService
 * @constructor
 * @ngInject
 * @struct
 * @extends {DrinkDetailCtrl}
 */
var NamedDrinkCtrl = function($scope, $injector, $routeParams, $location, DrinksService) {
  $injector.invoke(DrinkDetailCtrl, this);
  console.log("NamedDrinkCtrl", this);

  /** @type {string} */
  var drinkName = $routeParams['drinkName'];

  // Look up the drink by name.
  $scope.$watch(DrinksService.ready, function(value) {
    if (!value) { return; }

    var recipe = DrinksService.getDrink(drinkName);
    if (recipe) {
      this.setRecipe(recipe);
    } else {
      console.log("Didn't find drink, redirecting", drinkName,
          DrinksService.db);
      $location.path('/drinks').replace();
    }
  }.bind(this));
};
NamedDrinkCtrl.prototype = DrinkDetailCtrl.prototype;

/**
 * Generates a random recipe and shows a detail page for it.
 *
 * @param {angular.Scope} $scope
 * @param {angular.$injector} $injector
 * @param {angular.$location} $location
 * @param {md.$toast} $mdToast
 * @param {RandomDrink} RandomDrink
 * @param {DrinksService} DrinksService
 * @constructor
 * @ngInject
 * @struct
 * @extends {DrinkDetailCtrl}
 */
var RandomDrinkCtrl = function($scope, $injector, $location, $mdToast, RandomDrink, DrinksService) {
  $injector.invoke(DrinkDetailCtrl, this);

  $scope.$watch(DrinksService.ready, function(ready) {
    if (!ready) { return; }
    var name, weights;
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
    var i, recipe;
    for (i = 0; recipe === undefined && i < 5; i++) {
      recipe = RandomDrink.createDrink(name, weights);
    }
    if (!recipe) {
      $mdToast.simple().hideDelay(5000).
        content("Oops, that didn't work. Try again");
      $location.path('/drinks');
      return;
    }
    this.setRecipe(recipe);
  }.bind(this));
};
RandomDrinkCtrl.prototype = DrinkDetailCtrl.prototype;


angular.module('nebree8.drink-detail', ['nebree8.random-drink', 'nebree8.drinks'])
    .config(['$routeProvider',
      function($routeProvider) {
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
