/**
 * @constructor
 * @ngInject
 * @struct
 */
var RandomDrinkService = function ($rootScope, DrinksService) {
  /** @const */
  this.ALCOHOL = 0;
  /** @const */
  this.SWEET = 1;
  /** @const */
  this.SOUR = 2;
  /** @const */
  this.BITTER = 3;
  /** @const */
  this.FIZZY = 4;
  /** @const */
  this.ALL_INGREDIENTS = [
    ["agave syrup", [0, 1, 0, 0, 0]],
    ["angostura bitters", [0, 0, 0, 1, 0]],
    ["peychauds bitters", [0, 0, 0, 1, 0]],
    ["chocolate bitters", [0, 0, 0, 1, 0]],
    ["orange bitters", [0, 0, 0, 1, 0]],
    ["bourbon", [1, 0, 0, 0, 0]],
    ["peach schnapps", [0.5, 0.5, 0, 0, 0]],
    ["galliano", [0.5, 0.5, 0, 0, 0]],
    ["campari", [0.5, 0.5, 0, 1, 0]],
    ["triple sec", [0.5, 0.5, 0, 0, 0]],
    ["frangelico", [0.5, 0.5, 0, 0, 0]],
    ["gin", [1, 0, 0, 0, 0]],
    ["grenadine", [0, 1, 0, 0, 0]],
    ["honey syrup", [0, 1, 0, 0, 0]],
    ["maple syrup", [0, 1, 0, 0, 0]],
    ["kahlua", [0.5, 0.5, 0, 0, 0]],
    ["orange juice", [0, 0.8, 0.25, 0, 0]],
    ["lime juice", [0, 0, 1, 0, 0]],
    ["lemon juice", [0, 0, 1, 0, 0]],
    ["scotch", [1, 0, 0, 0, 0]],
    ["pimms", [0.5, 0.5, 0, 0, 0]],
    ["rum", [1, 0, 0, 0, 0]],
    ["rye", [1, 0, 0, 0, 0]],
    ["simple syrup", [0, 1, 0, 0, 0]],
    ["stoli", [1, 0, 0, 0, 0]],
    ["tequila", [1, 0, 0, 0, 0]],
    ["triple sec", [0.5, 0.5, 0, 0, 0]],
    ["vodka", [1, 0, 0, 0, 0]],
    ["dry vermouth", [0.5, 0.5, 0, 0.5, 0]],
    ["sweet vermouth", [0.5, 0.5, 0, 0.5, 0]],
    ["soda", [0, 0, 0, 0, 1]],
    ["tonic", [0, 0.2, 0, 0.3, 1]],
    ["cola", [0, 0.5, 0.3, 0, 1]],
  ];
  this.INGREDIENTS = [];

  $rootScope.$watch(DrinksService.ready, function(ready) {
    if (!ready) return;
    var i, ingredient;
    for (i = 0; i < this.ALL_INGREDIENTS.length; i++) {
      ingredient = this.ALL_INGREDIENTS[i];
      if (DrinksService.haveIngredient(ingredient[0])) {
        this.INGREDIENTS.push(ingredient);
      } else {
        console.log('Dropping ingredient ' + ingredient[0]);
      }
    }
  }.bind(this));
};

/**
 * Shuffles the array.
 * @param {Array<number>} arr
 * @private
 */
RandomDrinkService.prototype.shuffle = function(arr) {
  var i, r, t;
  for (i = 0; i < arr.length - 1; i++) {
    r = Math.floor(Math.random() * (arr.length - i));
    t = arr[i];
    arr[i] = arr[r];
    arr[r] = t;
  }
}

/**
 * @param {Array<number>} vec
 * @return {boolean}
 * @private
 */
RandomDrinkService.prototype.is_all_zeros = function(vec) {
  var i;
  for (i = 0; i < vec.length; i++) {
    if (vec[i] !== 0) {
      return false;
    }
  }
  return true;
}

/**
 * @param {Array<number>} vec
 * @return number
 * @private
 */
RandomDrinkService.prototype.sum = function(vec) {
  var i = 0;
  var s = 0;
  for (i = 0; i < vec.length; i++) {
    s += vec[i];
  }
  return s;
}

/**
 * CreateIngredients returns an array of ingredients totaling to weights.
 * @param {Array<number>} weights
 * @return {Array<nebree8.Ingredient>}
 * @private
 */
RandomDrinkService.prototype.chooseRandomIngredients = function(weights) {
  if (weights.length !== 5) {
    console.log("Bad weights provided: ", weights);
  }
  if (this.is_all_zeros(weights)) { return []; } /* Finished */
  var candidates = this.INGREDIENTS.filter(function(ingredient) {
    for (var j = 0; j < weights.length; j++) {
      if (weights[j] == 0 && ingredient[1][j] > 0) return false;
    }
    return true;
  })
  if (candidates.length == 0) return null;  /* Won't work */
  this.shuffle(candidates);
  for (var i = 0; i < candidates.length; i++) {
    var name = candidates[i][0];
    var ingredient_weights = candidates[i][1];
    /* Figure out the maximum amount we can add without going over any weight */
    var amount = 1000;
    for (var j = 0; j < weights.length; j++) {
      if (ingredient_weights[j] == 0) continue;
      var amount_j = weights[j] / ingredient_weights[j];
      if (amount_j < amount) amount = amount_j;
    }
    /* Calculate the new weights = weights - amount * ingredient_weights */
    var new_weights = new Array(weights.length);
    for (var j = 0; j < weights.length; j++) {
      new_weights[j] = weights[j] - amount * ingredient_weights[j];
    }
    /* Recursively find ingredients to fill the remaining weights */
    var remaining_ingredients = this.chooseRandomIngredients(new_weights);
    if (remaining_ingredients == null) {
      continue;  // This ingredient won't work.
    }
    // We found a recipe!
    var ingredient = {'name': name};
    if (name.indexOf('itters') != -1) {
      ingredient.drops = amount;
    } else {
      ingredient.parts = amount;
    }
    return [ingredient].concat(remaining_ingredients);
  }
  return null;  /* We failed to find ingredients to satisfy weights */
}

/**
 * createDrink produces a Recipe with the given name and weights. Total
 * oz is chosen to hit 2oz of alcohol or 5oz total for virgin drinks.
 * @param {string} name
 * @param {Array<number>} weights
 * @return {nebree8.Recipe}
 */
RandomDrinkService.prototype.createDrink = function (name, weights) {
  var ingredients = this.chooseRandomIngredients(weights);
  var total_oz = 5;
  if (weights[this.ALCOHOL]) {
    // If non-virgin, aim for 2oz of alcohol.
    total_oz = 2 * (this.sum(weights) - weights[this.BITTER]) /
        weights[this.ALCOHOL];
  }
  if (ingredients === null) {
    return null;
  }
  return /** @type{nebree8.Recipe} */({
    drink_name: name,
    ingredients: ingredients,
    total_oz: total_oz,
  });
}


angular.module('nebree8.random-drink', ['nebree8.drinks'])
    .service('RandomDrinkService', RandomDrinkService);
