declare namespace Reply {
  export type User = {
    id: Database.User["id"];
    name: Database.User["name"];
  };

  export type RecipeBook = {
    id: Database.RecipeBook["id"];
    name: Database.RecipeBook["name"];
  };

  export type Recipe = {
    id: Database.Recipe["id"];
    recipeBookId: Database.Recipe["recipe_book_id"];
    name: Database.Recipe["name"];
    time: Database.Recipe["time"];
    servings: Database.Recipe["servings"];
    ingredients: IngredientCategory[];
    steps: Database.Recipe["steps"];
    author: Database.Recipe["author"];
    notes: Database.Recipe["notes"];
    hasImage: Database.Recipe["has_image"];
    created_at: Database.Recipe["created_at"];
  };

  export type Favourite = {
    id: Database.Favourite["id"];
    userId: Database.Favourite["user_id"];
    recipeId: Database.Favourite["recipe_id"];
  };

  export type Note = {
    id: Database.Note["id"];
    userId: Database.Note["user_id"];
    recipeId: Database.Note["recipe_id"];
    note: Database.Note["note"];
  };

  export type Comment = {
    id: Database.Comment["id"];
    userId: Database.Comment["user_id"];
    recipeId: Database.Comment["recipe_id"];
    message: Database.Comment["message"];
    created_at: Database.Comment["created_at"];
  };
}
