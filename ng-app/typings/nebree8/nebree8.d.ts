interface Ingredient {
  name: string;
  parts?: number;
  drops?: number;
}

interface Recipe {
  drink_name: string;
  categories: Array<string>;
  ingredients: Array<Ingredient>;
  total_oz: number;
  template_name: string;
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
  rating?: number;
  id?: string;
  status?: string;
  done?: boolean;
  position?: number | string;
  approved?: boolean;
  progress_percent?: number;
}

interface OrderDrinkResponse {
  id: string;
}

interface OrderStatusResponse {
  approved: boolean;
  done: boolean;
  archived: boolean;
  queue_position: number;
  progress_percent: number;
}
