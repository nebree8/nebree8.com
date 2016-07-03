class Pantry {
  ingredients: {[name: string]: boolean} = {};

  constructor(ingredients: IngredientAvailability[]) {
    ingredients.forEach((i) => {
      this.ingredients[Pantry.normalizeIngredient(i.Name)] = i.Available;
    })
  }

  hasAllIngredients(drink: Recipe): boolean {
    for (var j = 0; j < drink.ingredients.length; j++) {
      var has = this.hasIngredient(drink.ingredients[j].name);
      if (!has) {
        console.log(typeof has == 'undefined'? "UNDEFINED!" : "Missing",
                    " ingredient ", drink.ingredients[j].name, " for ",
                    drink.drink_name, drink);
        return false;
      }
    }
    return true;
  }

  hasIngredient(ingredientName: string): boolean {
    return this.ingredients[Pantry.normalizeIngredient(ingredientName)];
  };

  private static normalizeIngredient(ingredientName: string): string {
    return ingredientName.toLowerCase();
  }
}

class DrinksService {
  db: ng.IPromise<Recipe[][]>;
  pantry: ng.IPromise<Pantry>;
  CATEGORY_ORDER: string[] = [
    'Featured',
    'Robot Inspired',
    'Classic Cocktails',
    'Non-Alcoholic',
  ];

  constructor($http: angular.IHttpService, private $q: angular.IQService) {
    this.pantry =
      $http.get('/api/get_config', { cache: false })
      .then((response: ng.IHttpPromiseCallbackArg<Config>) => {
        return new Pantry(response.data.Ingredients);
      });

    var recipes: ng.IHttpPromise<Recipe[][]> =
      $http.get('/all_drinks', { cache: true });
    this.db = $q<Recipe[][]>((resolve, reject) => {
      $q.all([recipes, this.pantry]).then((args: any[]) => {
        var recipe_response: ng.IHttpPromiseCallbackArg<Recipe[]> = args[0];
        var pantry: Pantry = args[1];
        var recipesOnHand = recipe_response.data.filter((recipe) => {
          return pantry.hasAllIngredients(recipe);
        });
        var categories: any = {};
        angular.forEach(recipesOnHand, (recipe) => {
          angular.forEach(recipe.categories, (category: string) => {
            if (category in categories) {
              categories[category].push(recipe);
            } else {
              categories[category] = [recipe];
              categories[category].name = category;
            }
          });
        });
        var db: Recipe[][] = [];
        for (var i: number = 0; i < this.CATEGORY_ORDER.length; i++) {
          db.push(categories[this.CATEGORY_ORDER[i]]);
        }

        resolve(db);
      }, reject);
    });
  }

  slugifyDrinkName(name: string): string {
    return name.toLowerCase().replace(/[ ()]/g, "_").replace(/&/g, 'and');
  };

  getDrink(drinkName: string): ng.IPromise<Recipe> {
    return this.db.then((db) => {
      drinkName = this.slugifyDrinkName(drinkName);
      for (var i = 0; i < db.length; i++) {
        for (var j = 0; j < db[i].length; j++) {
          if (this.slugifyDrinkName(db[i][j].drink_name) === drinkName) {
            return db[i][j];
          }
        }
      }
      return this.$q.reject("Recipe not found");
    });
  };
}

angular.module('nebree8.drinks', []).service('DrinksService', DrinksService);
