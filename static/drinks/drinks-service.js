/*global angular */
angular.module('nebree8.drinks', [])

.service('DrinksService', function ($http, $q) {
  var service = this;
  var ready = false;

  this.db = [];
  this.ingredients = {};
  this.ready = function() { return ready; };

  this.slugifyDrinkName = function(name) {
    return name.toLowerCase().replace(/[ ()]/g, "_").replace(/&/g, 'and');
  };

  this.getDrink = function(drinkName) {
    drinkName = this.slugifyDrinkName(drinkName);
    var i;
    for (i = 0; i < this.db.length; i++) {
      if (this.slugifyDrinkName(this.db[i].drink_name) === drinkName) {
        return this.db[i];
      }
    }
  };

  function normalizeIngredient(ingredientName) {
    return ingredientName.toLowerCase();
  }

  this.haveIngredient = function(ingredientName) {
    return this.ingredients[normalizeIngredient(ingredientName)];
  };

  var drinksPromise = $http.get('/all_drinks', { cache: true });
  var configPromise = $http.get('/api/get_config', { cache: false });


  function haveAllIngredients(drink) {
    var j;
    for (j = 0; j < drink.ingredients.length; j++) {
      if (!service.ingredients[normalizeIngredient(drink.ingredients[j].name)]) {
        return false;
      }
    }
    return true;
  };

  function setIngredients(config) {
    var i, ingredient;
    console.log('config', config);
    for (i = 0; i < config.Ingredients.length; i++) {
      ingredient = config.Ingredients[i];
      service.ingredients[normalizeIngredient(ingredient.Name)] = ingredient.Available;
    }
  };

  $q.all([drinksPromise, configPromise]).then(function(data) {
    var drinks = data[0].data;
    setIngredients(data[1].data);
    var i, drink;
    for (i = 0; i < drinks.length; i++) {
      drink = drinks[i];
      if (haveAllIngredients(drink)) {
        service.db.push(drink);
      } else {
        console.log("Skipping drink: " + drink.drink_name, drink);
      }
    }
    ready = true;
  });
});
