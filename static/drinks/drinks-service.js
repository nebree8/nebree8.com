/*global angular */

/**
 * @param {angular.$http} $http
 * @param {angular.$q} $q
 * @constructor
 * @ngInject
 * @struct
 */
var DrinksService = function ($http, $q) {
  /** @type {boolean} */
  var ready = false;

  /** @type {Array<nebree8.Recipe>} */
  this.db = [];
  /** @type {Object.<string, boolean>} */
  this.ingredients = {};
  this.ready = function() { return ready; };

  var drinksPromise = $http.get('/all_drinks', { cache: true });
  var configPromise = $http.get('/api/get_config', { cache: false });


  $q.all([drinksPromise, configPromise]).then(function(data) {
    this.setIngredients(data[1].data);
    this.setRecipes(data[0].data);
    ready = true;
  }.bind(this));
}

/**
 * @param {nebree8.Recipe} drink
 * @return {boolean}
 * @private
 */
DrinksService.prototype.haveAllIngredients = function(drink) {
  var j;
  for (j = 0; j < drink.ingredients.length; j++) {
    if (!this.ingredients[this.normalizeIngredient(drink.ingredients[j].name)])
      return false;
  }
  return true;
}

/**
 * @param {nebree8.Config} config
 * @private
 */
DrinksService.prototype.setIngredients = function(config) {
  for (var i = 0; i < config.Ingredients.length; i++) {
    var ingredient = config.Ingredients[i];
    this.ingredients[this.normalizeIngredient(ingredient.Name)] =
        ingredient.Available;
  }
}

/**
 * @param {Array<nebree8.Recipe>} recipes
 * @private
 */
DrinksService.prototype.setRecipes = function(recipes) {
  for (var i = 0; i < recipes.length; i++) {
    var recipe = recipes[i];
    if (this.haveAllIngredients(recipe)) {
      this.db.push(recipe);
    } else {
      console.log("Skipping recipe: " + recipe.drink_name, recipe);
    }
  }
}

/**
 * @param {string} ingredientName
 * @return {string}
 * @private
 */
DrinksService.prototype.normalizeIngredient = function(ingredientName) {
  return ingredientName.toLowerCase();
}

/**
 * @param {string} name
 * @return {string}
 */
DrinksService.prototype.slugifyDrinkName = function(name) {
  return name.toLowerCase().replace(/[ ()]/g, "_").replace(/&/g, 'and');
};

/**
 * @param {string} drinkName
 * @return {nebree8.Recipe}
 */
DrinksService.prototype.getDrink = function(drinkName) {
  drinkName = this.slugifyDrinkName(drinkName);
  for (var i = 0; i < this.db.length; i++) {
    if (this.slugifyDrinkName(this.db[i].drink_name) === drinkName) {
      return this.db[i];
    }
  }
  return null;
};

/**
 * @param {string} ingredientName
 * @return {boolean}
 */
DrinksService.prototype.haveIngredient = function(ingredientName) {
  return this.ingredients[this.normalizeIngredient(ingredientName)];
};


angular.module('nebree8.drinks', []).service('DrinksService', DrinksService);
