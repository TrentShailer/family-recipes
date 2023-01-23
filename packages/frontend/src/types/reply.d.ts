declare namespace Reply {
  export type User = {
    id: string;
    name: string;
  };

  export type Session = {
    userId: string;
    name: string;
  };

  export type IngredientCategory = {
    name: string;
    ingredients: string[];
  };

  export type RecipeBook = {
    id: string;
    name: string;
  };

  export type Recipe = {
    id: string;
    recipeBookId: string;
    name: string;
    time: number;
    servings: number;
    ingredients: IngredientCategory[];
    steps: string[];
    author: string;
    notes: string | null | undefined;
    created_at: Date;
  };

  export type Favourite = {
    id: string;
    userId: string;
    recipeId: string;
  };

  export type Note = {
    id: string;
    userId: string;
    recipeId: string;
    note: string;
  };

  export type Comment = {
    id: string;
    userId: string;
    recipeId: string;
    message: string;
    created_at: Date;
  };
}
