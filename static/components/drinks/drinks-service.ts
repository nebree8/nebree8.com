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
  db: ng.IPromise<Recipe[]>;
  pantry: ng.IPromise<Pantry>;

  constructor($http: angular.IHttpService, private $q: angular.IQService) {
    this.pantry =
      $http.get('/api/get_config', { cache: false })
      .then((response: ng.IHttpPromiseCallbackArg<Config>) => {
        return new Pantry(response.data.Ingredients);
      });

    var recipes: ng.IHttpPromise<Recipe[]> =
      $http.get('/all_drinks', { cache: true });
    this.db = $q<Recipe[]>((resolve, reject) => {
      $q.all([recipes, this.pantry]).then((args: any[]) => {
        var recipe_response: ng.IHttpPromiseCallbackArg<Recipe[]> = args[0];
        var pantry: Pantry = args[1];
        resolve(recipe_response.data.filter((recipe) => {
          return pantry.hasAllIngredients(recipe);
        }));
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
        if (this.slugifyDrinkName(db[i].drink_name) === drinkName) {
          return db[i];
        }
      }
      return this.$q.reject("Recipe not found");
    });
  };
}

angular.module('nebree8.drinks', []).service('DrinksService', DrinksService);
