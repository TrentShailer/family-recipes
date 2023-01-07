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
    recipe_book_id: Database.Recipe["recipe_book_id"];
    name: Database.Recipe["name"];
    time: Database.Recipe["time"];
    servings: Database.Recipe["servings"];
    ingredients: IngredientCategory[];
    steps: Database.Recipe["steps"];
    author: Database.Recipe["author"];
    notes: Database.Recipe["notes"];
    created_at: Database.Recipe["created_at"];
  };

  export type Favourite = {
    id: Database.Favourite["id"];
    user_id: Database.Favourite["user_id"];
    recipe_id: Database.Favourite["recipe_id"];
  };

  export type Note = {
    id: Database.Note["id"];
    user_id: Database.Note["user_id"];
    recipe_id: Database.Note["recipe_id"];
    note: Database.Note["note"];
  };

  export type Comment = {
    id: Database.Comment["id"];
    user_id: Database.Comment["user_id"];
    recipe_id: Database.Comment["recipe_id"];
    message: Database.Comment["message"];
    created_at: Database.Comment["created_at"];
  };
}
