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
    "mescal": [1, 0, 0, 0, 0],
    "orange bitters": [0, 0, 0, 0.5, 0],
    "orange juice": [0, 0.8, 0.25, 0, 0],
    "peach schnapps": [0.5, 0.5, 0, 0, 0],
    "peychauds bitters": [0, 0, 0, 0.5, 0],
    "pimms": [0.5, 0.5, 0, 0, 0],
    "rose": [0, 0, 0, 0.5, 0],
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

  // Array of divisor and probability. If we fall off the end, assume 1.0.
  private PROPORTION_PROBABILITIES = [
    [2, .2],
    [3, .05],
    [4, .05],
  ];
  private MIN_PROPORTION = .25;

  constructor(private $q: angular.IQService,
              $rootScope: angular.IRootScopeService,
              DrinksService: DrinksService) {
    this.INGREDIENTS = DrinksService.pantry.then((pantry) => {
      var result: IngredientInfo[] = [];
      angular.forEach(pantry.ingredients, (available, name) => {
        if (typeof this.ALL_INGREDIENTS[name] == 'undefined') {
          console.log("Missing random weights for ingredient", name);
        } else if (available) {
          result.push({'name': name, 'weights': this.ALL_INGREDIENTS[name]});
        }
      });
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

  private chooseProportion(amount: number): number {
    if (amount < this.MIN_PROPORTION) return amount; // Never increase value.
    var r = Math.random();
    for (var i = 0; i < this.PROPORTION_PROBABILITIES.length; i++) {
      var p = this.PROPORTION_PROBABILITIES[i];
      if (r < p[1]) {
        var reduced = amount / p[0];
        return reduced < this.MIN_PROPORTION ? this.MIN_PROPORTION : reduced;
      }
      r -= p[1];
    }
    return amount;
  }

  private chooseRandomIngredients(ingredients: IngredientInfo[],
                                  weights: number[]): Ingredient[] {
    if (weights.length !== 5) {
      console.log("Bad weights provided: ", weights);
    }
    if (this.is_all_zeros(weights)) { return []; } /* Finished */
    for (var i = 0; i < ingredients.length; i++) {
      var name = ingredients[i].name;
      var ingredient_weights = ingredients[i].weights;
      /* Figure out the maximum amount we can add without going over any weight */
      var amount = 1000;
      for (var j = 0; j < weights.length; j++) {
        if (ingredient_weights[j] == 0) continue;
        var amount_j = weights[j] / ingredient_weights[j];
        if (amount_j < amount) {
          amount = amount_j;
        }
      }
      if (amount == 0) continue;
      var original_amount = amount;
      amount = this.chooseProportion(amount);
      do {
        /* Calculate the new weights = weights - amount * ingredient_weights */
        var new_weights = new Array(weights.length);
        for (var j = 0; j < weights.length; j++) {
          new_weights[j] = weights[j] - amount * ingredient_weights[j];
        }
        /* Recursively find ingredients to fill the remaining weights */
        var remaining_ingredients = this.chooseRandomIngredients(
          ingredients.slice(i + 1), new_weights);
        if (remaining_ingredients !== null || amount == original_amount) break;
        amount = original_amount; // Try again with the full proportion.
      } while (true);
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

  private format(r: Recipe): string {
    var s = r.drink_name + "(" + r.total_oz + " oz): ";
    for (var i = 0; i < r.ingredients.length; i++) {
      var ingredient = r.ingredients[i];
      s += "\n";
      if (ingredient.drops) s += ingredient.drops + " drops ";
      else s += ingredient.parts + " parts ";
      s += ingredient.name;
    }
    return s;
  }

  private createInternal(name: string, weights: number[]): ng.IPromise<Recipe> {
    return this.INGREDIENTS.then((possible_ingredients) => {
      possible_ingredients = possible_ingredients.slice(0);
      this.shuffle(possible_ingredients);
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
      var r: Recipe = {
        drink_name: name,
        categories: [],
        ingredients: ingredients,
        total_oz: total_oz,
      };
      console.log(this.format(r));
      return r;
    });
  }

  createDrink(): ng.IPromise<Recipe> {
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
    return this.createInternal(name, weights);
  }
}

angular.module('nebree8.random-drink', ['nebree8.drinks'])
    .service('RandomDrinkService', RandomDrinkService);
