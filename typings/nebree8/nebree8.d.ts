interface Ingredient {
  name: string;
  parts?: number;
  drops?: number;
}

interface Recipe {
  drink_name: string;
  ingredients: Array<Ingredient>;
  total_oz: number;
}

interface IngredientAvailability {
  Name: string;
  Available: boolean;
}

interface Config {
  Ingredients: Array<IngredientAvailability>
}

interface Order extends Recipe {
  user_name?: string;
  rating?: int;
  id?: string;
}

interface OrderDrinkResponse {
  id: string;
}
