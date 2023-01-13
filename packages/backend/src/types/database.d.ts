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
    recipe_book_id: string;
    name: string;
    time: number;
    servings: number;
    ingredients: IngredientCategory[];
    steps: string[];
    author: string;
    notes: string | null | undefined;
    has_image: boolean;
    created_at: Date;
  };

  export type Favourite = {
    id: string;
    user_id: string;
    recipe_id: string;
  };

  export type Note = {
    id: string;
    user_id: string;
    recipe_id: string;
    note: string;
  };

  export type Comment = {
    id: string;
    user_id: string;
    recipe_id: string;
    message: string;
    created_at: Date;
  };
}
