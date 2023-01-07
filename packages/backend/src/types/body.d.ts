declare namespace Body {
  export type User = {
    name: string;
    password: string;
  };

  export type RecipeBook = {
    name: string;
    password: string;
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
  };

  export type Comment = {
    id: string;
    user_id: string;
    recipe_id: string;
    message: string;
    created_at: Date;
  };
}
