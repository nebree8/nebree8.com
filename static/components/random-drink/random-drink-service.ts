interface IngredientInfo {
  name: string;
  weights: number[];
}

function RandomName() {
  var ADJECTIVES = ["disgruntled", "athletic", "magnificent", "geriatric", "moldy", "piping", "roiling", "bulky", "moist", "attractive", "stunning", "dank", "watery", "glorious", "sunken", "perky", "sultry", "smarmy", "kitschy", "constant", "crunchy", "hot", "saucy", "rousing", "sleepy", "smoking", "offensive", "spooky", "medical", "unctuous", "healthy", "unhealthy", "alluring", "gorgeous", "cute", "petite", "crude", "rude", "appealing", "lyrical", "janky", "dysfunctional", "softcore", "traditional", "contrived", "kinky", "well", "proportioned", "native", "foreign", "grand", "sugary", "subtle", "groovy", "curved", "silly", "well", "endowed", "plain", "faulty", "fake", "linear", "boring", "callipygian", "crawling", "lying", "imperialistic", "wired", "rugged", "chunky", "ravenous", "sex-crazed", "anatomically", "correct", "smooth", "wild", "salty", "clean", "handsome", "muscly", "unsavory", "theatrical", "buxom", "pretty", "beautiful", "haunting", "memorable", "classy", "orange", "purple", "sweet", "velveteen", "blue", "vile", "green", "ornery", "mild", "rocking", "bashful", "hardcore", "necessary", "horny", "skanky", "languid", "sanguine", "lanky", "proud", "scandalous", "sour", "cranky", "soul-crushing", "rolling", "inebriating", "pandering", "raunchy", "reckless", "feckless", "enticing", "blasphemous", "jaunty", "jovial", "jocund", "arrogant", "mislabeled", "funky", "crabby", "malevolent", "fraudulent", "sexy", "ironic", "trite", "empty", "odoriferous", "snooty", "spectacular", "sportsmanlike", "fascinating", "ultimate", "penultimate", "punctual", "humble", "young", "nubile", "fresh", "ripe", "raucous", "hairy", "fuzzy", "fluffy", "fun", "funny", "dull", "small", "large", "huge", "tiny", "infinite", "nonexistent", "well", "placed", "successful", "unsuccessful", "pathetic", "unarmed", "dirty", "ever changing"];

  var ADVERBS = ["functionally", "strangely", "wisely", "sagaciously", "softly", "overpoweringly", "coyly", "subtly", "stiflingly", "frantically", "thoroughly", "wishfully", "formidably", "thoughtfully", "pedantically", "momentarily", "mildly", "frustratingly", "angrily", "habitually", "seductively", "devilishly", "potentially", "platonically", "monotonously", "meanderingly", "pointedly", "decidedly", "fortunately", "disapprovingly", "shockingly", "wishfully", "wantonly", "wanly", "victoriously", "honestly", "totally", "truly", "fascinatingly", "musically", "reassuringly", "joyfully", "hopefully", "happily", "ethereally", "ephemerally", "fleetingly", "horribly", "gracefully", "clumsily"];

  var NOUNS = ["patron", "benefactor", "nemesis", "ally", "pedophilia", "trap", "cup", "warmth", "winter", "spring", "fall", "summer", "regret", "rag-doll", "punk", "goth", "visigoth", "marauder", "vision", "lobster", "sunrise", "american", "local", "horror", "husband", "wife", "sweet-wine", "cocktail", "humps", "terrorist", "anarchist", "lad", "wench", "cherry", "jezebel", "thought", "wish", "wonder", "actor", "engineer", "dope", "partner", "politician", "seductress", "demon", "incubus", "succubus", "devil", "scowl", "smile", "rebel", "king", "queen", "cephalopod", "snail", "monster", "bed", "sheets", "master", "mistress", "suitor", "odyssey", "adonis", "sculpture", "wanker", "nipples", "member", "phallus", "tits", "titties", "butt", "ass", "arse", "goblet", "tankard", "vessel", "lute", "affair", "hookup", "telephone", "taunt", "orgasm", "ejaculation", "semen", "pinstripes", "candy", "victory", "loser", "nerd", "geek", "illusion", "dork", "funk", "shaft", "shorts", "music", "battle", "plan", "foreplay", "tease", "toy", "tongue", "lips", "mouth", "accessory", "gadget", "bonus", "joystick", "job", "rod", "pumpkin", "flower", "plot", "limit", "theorem", "postulation", "posture", "position", "angle", "arrangement", "book", "location", "drunk", "rapture", "proverb", "song", "songbird", "porpoise", "raven", "sex", "appeal", "obsession", "stalker", "pork", "argument", "bumpkin", "yodel", "model", "actress", "swagger", "strut", "strategy", "arousal", "muscles", "flex", "man", "sex", "sanctum", "sanctuary", "priest", "pope", "hat", "lingerie", "codpiece", "cock", "crunch", "sample", "letter", "word", "hunk", "specimen", "abs", "noodles", "cavern", "crotch", "thighs", "chest", "business", "nap", "body", "porn", "elderly", "muck", "swashbuckler", "renegade", "rogue", "rapscallion", "wanderer", "milkshake", "nectar", "honey", "sap", "brew", "potion"];

  var FORMULAE_BY_WEIGHT: [number, ()=>string][] = [
    [1, () => thing()],
    [1, () => adjective()],
    [3, () => thing() + ' and ' + thing()],
    [2, () => adjective() + ' and ' + adjective()],
    [1, () => 'the ' + adjective() + ' and ' + thing()],
    [1, () => 'the ' + thing() + ' and the ' + thing()],
  ];

  function calc_weights(formulae: [number, ()=>string][]):
      [number, ()=>string][] {
    var total_weight = 0;
    for (var i = 0; i < formulae.length; i++) {
      total_weight += formulae[i][0];
    }
    var stop_points: [number, ()=>string][] = [];
    var cumulative_total = 0;
    for (var i = 0; i < formulae.length; i++) {
      var increment = formulae[i][0]/total_weight;
      cumulative_total += increment;
      stop_points.push([cumulative_total, formulae[i][1]]);
    }
    return stop_points;
  }

  function invoke(weights: [number, ()=>string][]) {
    var r = Math.random();
    window.console.log(r);
    for (var i = 0; i < weights.length; i++) {
      if (r < weights[i][0]) {
        return weights[i][1]();
      }
    }
  }

  function oneof<T>(l: T[]): T {
    return l[Math.floor(Math.random() * l.length)];
  }

  function thing() {
    if (Math.random() < .5) return oneof(NOUNS);
    return adjective() + " " + oneof(NOUNS);
  }

  function adjective(): string {
    if (Math.random() < .5) return oneof(ADJECTIVES);
    return oneof(ADVERBS) + " " + adjective();
  }

  var weights = calc_weights(FORMULAE_BY_WEIGHT);
  return invoke(weights);
}

class RandomDrinkService {
  private ALCOHOL = 0;
  private SWEET = 1;
  private SOUR = 2;
  private BITTER = 3;
  private FIZZY = 4;
  private ALL_INGREDIENTS:
      {[name: string]: [number, number, number, number, number]} = {
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
      var is_bitter =
          ingredient_weights[this.BITTER] == this.sum(ingredient_weights);
      amount = this.chooseProportion(amount);
      if (is_bitter) {
        amount = Math.ceil(amount);
      }
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
      if (is_bitter) {
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
        drink_name: RandomName(),
        categories: [],
        ingredients: ingredients,
        total_oz: total_oz,
        template_name: name,
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
