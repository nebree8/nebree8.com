interface IngredientInfo {
  name: string;
  weights: number[];
}

class RandomDrinkService {
  private ALCOHOL = 0;
  private SWEET = 1;
  private SOUR = 2;
  private BITTER = 3;
  private FIZZY = 4;
  private ALL_INGREDIENTS: {[name: string]: number[]} = {
    "agave syrup": [0, 1, 0, 0, 0],
    "amaretto": [0.5, 0.5, 0, 0, 0],
    "angostura bitters": [0, 0, 0, 0.5, 0],
    "bourbon": [1, 0, 0, 0, 0],
    "campari": [0.5, 0.5, 0, 1, 0],
    "chocolate bitters": [0, 0, 0, 0.5, 0],
    "cola": [0, 0.5, 0.3, 0, 1],
    "dry vermouth": [0.5, 0.5, 0, 0.5, 0],
    "frangelico": [0.5, 0.5, 0, 0, 0],
    "galliano": [0.5, 0.5, 0, 0, 0],
    "gin": [1, 0, 0, 0, 0],
    "grenadine": [0, 1, 0, 0, 0],
    "honey syrup": [0, 1, 0, 0, 0],
    "kahlua": [0.5, 0.5, 0, 0, 0],
    "lemon juice": [0, 0, 1, 0, 0],
    "lime juice": [0, 0, 1, 0, 0],
    "maple syrup": [0, 1, 0, 0, 0],
    "orange bitters": [0, 0, 0, 0.5, 0],
    "orange juice": [0, 0.8, 0.25, 0, 0],
    "peach schnapps": [0.5, 0.5, 0, 0, 0],
    "peychauds bitters": [0, 0, 0, 0.5, 0],
    "pimms": [0.5, 0.5, 0, 0, 0],
    "rum": [1, 0, 0, 0, 0],
    "rye": [1, 0, 0, 0, 0],
    "scotch": [1, 0, 0, 0, 0],
    "simple syrup": [0, 1, 0, 0, 0],
    "soda": [0, 0, 0, 0, 1],
    "stoli": [1, 0, 0, 0, 0],
    "sweet vermouth": [0.5, 0.5, 0, 0.5, 0],
    "tequila": [1, 0, 0, 0, 0],
    "tonic": [0, 0.2, 0, 0.3, 1],
    "triple sec": [0.5, 0.5, 0, 0, 0],
    "vodka": [1, 0, 0, 0, 0],
  };
  private INGREDIENTS: ng.IPromise<IngredientInfo[]>;

  constructor(private $q: angular.IQService,
              $rootScope: angular.IRootScopeService,
              DrinksService: DrinksService) {
    this.INGREDIENTS = DrinksService.pantry.then((pantry) => {
      var result: IngredientInfo[] = [];
      for (var name in this.ALL_INGREDIENTS) {
        if (Object.prototype.hasOwnProperty.call(this.ALL_INGREDIENTS, name)) {
          if (pantry.hasIngredient(name)) {
            result.push({'name': name, 'weights': this.ALL_INGREDIENTS[name]});
          } else {
            console.log('Dropping ingredient ' + name)
          }
        }
      }
      return result;
    });
  }

  private shuffle<T>(arr: T[]) {
    for (var i = 0; i < arr.length - 1; i++) {
      var r = Math.floor(Math.random() * (arr.length - i));
      var t = arr[i];
      arr[i] = arr[r];
      arr[r] = t;
    }
  }

  private is_all_zeros(vec: number[]): boolean {
    for (var i = 0; i < vec.length; i++) {
      if (vec[i] !== 0) {
        return false;
      }
    }
    return true;
  }

  private sum(vec: number[]): number {
    var i = 0;
    var s = 0;
    for (i = 0; i < vec.length; i++) {
      s += vec[i];
    }
    return s;
  }

  private chooseRandomIngredients(ingredients: IngredientInfo[],
                                  weights: number[]): Ingredient[] {
    if (weights.length !== 5) {
      console.log("Bad weights provided: ", weights);
    }
    if (this.is_all_zeros(weights)) { return []; } /* Finished */
    var candidates = ingredients.filter(function(ingredient) {
      for (var j = 0; j < weights.length; j++) {
        if (weights[j] == 0 && ingredient.weights[j] > 0) return false;
      }
      return true;
    })
    if (candidates.length == 0) return null;  /* Won't work */
    this.shuffle(candidates);
    for (var i = 0; i < candidates.length; i++) {
      var name = candidates[i].name;
      var ingredient_weights = candidates[i].weights;
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
      var remaining_ingredients = this.chooseRandomIngredients(ingredients,
                                                               new_weights);
      if (remaining_ingredients == null) {
        continue;  // This ingredient won't work.
      }
      // We found a recipe!
      var ingredient : Ingredient = {'name': name};
      if (ingredient_weights[this.BITTER] == this.sum(ingredient_weights)) {
        ingredient.drops = amount;
      } else {
        ingredient.parts = amount;
      }
      return [ingredient].concat(remaining_ingredients);
    }
    return null;  /* We failed to find ingredients to satisfy weights */
  }

  createDrink(name: string, weights: number[]): ng.IPromise<Recipe> {
    return this.INGREDIENTS.then((possible_ingredients) => {
      var ingredients = this.chooseRandomIngredients(possible_ingredients,
                                                     weights);
      var total_oz = 5;
      if (weights[this.ALCOHOL]) {
        // If non-virgin, aim for 2oz of alcohol.
        total_oz = 2 * (this.sum(weights) - weights[this.BITTER]) /
            weights[this.ALCOHOL];
      }
      if (ingredients === null) {
        return this.$q.reject("Couldn't find a recipe.");
      }
      return {
        drink_name: name,
        ingredients: ingredients,
        total_oz: total_oz,
      };
    });
  }
}

angular.module('nebree8.random-drink', ['nebree8.drinks'])
    .service('RandomDrinkService', RandomDrinkService);
