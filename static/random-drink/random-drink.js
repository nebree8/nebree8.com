/*global angular */
angular.module('nebree8.random-drink', [])

.service('RandomDrink', function () {
  var INGREDIENTS = [
    ["agave", [0, 1, 0, 0, 0]],
    ["angostura bitters", [0, 0, 0, 1, 0]],
    ["peychauds bitters", [0, 0, 0, 1, 0]],
    ["chocolate bitters", [0, 0, 0, 1, 0]],
    ["orange bitters", [0, 0, 0, 1, 0]],
    ["bourbon", [1, 0, 0, 0, 0]],
    ["peach schnapps", [0.5, 0.5, 0, 0, 0]],
  /* ["galliano", [0.5, 0.5, 0, 0, 0]], RAN OUT */
    ["campari", [0.5, 0.5, 0, 1, 0]],
    ["triple sec", [0.5, 0.5, 0, 0, 0]],
    ["frangelico", [0.5, 0.5, 0, 0, 0]],
    ["gin", [1, 0, 0, 0, 0]],
    ["grenadine", [0, 1, 0, 0, 0]],
    ["honey", [0, 1, 0, 0, 0]],
    ["maple", [0, 1, 0, 0, 0]],
    ["kahlua", [0.5, 0.5, 0, 0, 0]],
    ["orange", [0, 0.8, 0.25, 0, 0]],
    ["lime", [0, 0, 1, 0, 0]],
    ["lemon", [0, 0, 1, 0, 0]],
    ["scotch", [1, 0, 0, 0, 0]],
    ["pimms", [0.5, 0.5, 0, 0, 0]],
    ["rum", [1, 0, 0, 0, 0]],
    ["rye", [1, 0, 0, 0, 0]],
    ["simple", [0, 1, 0, 0, 0]],
  /*  ["stoli", [1, 0, 0, 0, 0]],  Why have stoli? We have vodka! */
    ["tequila", [1, 0, 0, 0, 0]],
    ["triple sec", [0.5, 0.5, 0, 0, 0]],
    ["vodka", [1, 0, 0, 0, 0]],
    ["dry vermouth", [0.5, 0.5, 0, 0.5, 0]],
    ["sweet vermouth", [0.5, 0.5, 0, 0.5, 0]],
    ["soda", [0, 0, 0, 0, 1]],
    ["tonic", [0, 0.2, 0, 0.3, 1]],
    ["cola", [0, 0.5, 0.3, 0, 1]],
  ];

  /*
   * Shuffles the array.
   */
  function shuffle(arr) {
    var i, r, t;
    for (i = 0; i < arr.length - 1; i++) {
      r = Math.floor(Math.random() * (arr.length - i));
      t = arr[i];
      arr[i] = arr[r];
      arr[r] = t;
    }
  }

  function is_all_zeros(vec) {
    var i;
    for (i = 0; i < vec.length; i++) {
      if (vec[i] !== 0) {
        return false;
      }
    }
    return true;
  }

  function sum(vec) {
    var i = 0;
    var s = 0;
    for (i = 0; i < vec.length; i++) {
      s += vec[i];
    }
    return s;
  }

  /*
   * CreateIngredients returns an array of ingredients totaling to weights.
   */
  function CreateIngredients(weights) {
    if (weights.length !== 5) {
      console.log("Bad weights provided: ", weights);
    }
    if (is_all_zeros(weights)) { return []; } /* Finished */
    var candidates = INGREDIENTS.filter(function(ingredient) {
        for (var j = 0; j < weights.length; j++) {
          if (weights[j] == 0 && ingredient[1][j] > 0) return false;
        }
        return true;
    })
    if (candidates.length == 0) return undefined;  /* Won't work */
    shuffle(candidates);
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
      var remaining_ingredients = CreateIngredients(new_weights);
      if (remaining_ingredients == undefined) {
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
    return undefined;  /* We failed to find ingredients to satisfy weights */
  }

  /*
   * createDrink produces a Recipe with the given name and weights. Total
   * oz is chosen to hit 2oz of alcohol or 5oz total for virgin drinks.
   */
  this.createDrink = function (name, weights) {
    var ingredients = CreateIngredients(weights);
    var total_oz = 5;
    if (weights[0]) {
      // If non-virgin, aim for 2oz of alcohol (weights[0]).
      var total_oz = 2 * sum(weights) / weights[0];
    }
    if (ingredients === undefined) {
      return undefined;
    }
    return {
      'drink_name': name,
      'ingredients': ingredients,
      'total_oz': total_oz
    }
  }
});
