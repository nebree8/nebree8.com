
var nebree8 = {};

/**
 * @constructor
 * @struct
 */
nebree8.Config = function() {
  /**
   * @type {Array<{Name: string, Available: boolean}>}
   */
  this.Ingredients;
};

/**
 * @constructor
 * @struct
 */
nebree8.Recipe = function() {
  /** @type{string} */
  this.drink_name;
  /** @type{Array<nebree8.Ingredient>} */
  this.ingredients;
  /** @type{number} */
  this.total_oz;
  /** @type{string} */
  this.user_name;
};

/**
 * @constructor
 * @struct
 */
nebree8.Ingredient = function() {
  /** @type{string} */
  this.name;
  /** @type{!number} */
  this.drops;
  /** @type{!number} */
  this.parts;
};
