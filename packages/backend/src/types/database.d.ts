declare namespace Database {
  export type User = {
    id: string;
    name: string;
    password: string;
  };

  export type RecipeBook = {
    id: string;
    name: string;
    password: string;
  };

  export type IngredientCategory = {
    name: string;
    ingredients: string[];
  };

  export type Recipe = {
    id: string;
    name: string;
    time: string;
    servings: string;
    ingredients: IngredientCategory[];
    steps: string[];
    author: string;
    notes: string | null | undefined;
    created_at: Date;
  };

  export type Comment = {
    id: string;
    user_id: string;
    recipe_id: string;
    message: string;
    created_at: Date;
  };
}
