class RandomDrinkService {
  private ALL_INGREDIENTS: any[] = [
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
  private INGREDIENTS: ng.IPromise<any[]>;
  private ALCOHOL = 0;
  private SWEET = 1;
  private SOUR = 2;
  private BITTER = 3;
  private FIZZY = 4;

  constructor(private $q: angular.IQService,
              $rootScope: angular.IRootScopeService,
              DrinksService: DrinksService) {
    this.INGREDIENTS = DrinksService.pantry.then((pantry) => {
      return this.ALL_INGREDIENTS.filter((ingredient) => {
        var b = pantry.hasIngredient(ingredient[0]);
        if (!b) console.log('Dropping ingredient ' + ingredient[0]);
        return b;
      });
    });
  }

  private shuffle(arr: Array<number>) {
    for (var i = 0; i < arr.length - 1; i++) {
      var r = Math.floor(Math.random() * (arr.length - i));
      var t = arr[i];
      arr[i] = arr[r];
      arr[r] = t;
    }
  }

  private is_all_zeros(vec: Array<number>): boolean {
    var i;
    for (i = 0; i < vec.length; i++) {
      if (vec[i] !== 0) {
        return false;
      }
    }
    return true;
  }

  private sum(vec: Array<number>): number {
    var i = 0;
    var s = 0;
    for (i = 0; i < vec.length; i++) {
      s += vec[i];
    }
    return s;
  }

  private chooseRandomIngredients(ingredients: any[], weights: Array<number>): Array<Ingredient> {
    if (weights.length !== 5) {
      console.log("Bad weights provided: ", weights);
    }
    if (this.is_all_zeros(weights)) { return []; } /* Finished */
    var candidates = ingredients.filter(function(ingredient) {
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
      var remaining_ingredients = this.chooseRandomIngredients(ingredients,
                                                               new_weights);
      if (remaining_ingredients == null) {
        continue;  // This ingredient won't work.
      }
      // We found a recipe!
      var ingredient : Ingredient = {'name': name};
      if (name.indexOf('itters') != -1) {
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
