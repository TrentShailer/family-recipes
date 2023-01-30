import axios from "axios";
import {
  OptionsObject,
  SnackbarKey,
  SnackbarMessage,
  useSnackbar,
} from "notistack";
import * as React from "react";

async function GetTags(
  recipeId: string,
  enqueueSnackbar: (
    message: SnackbarMessage,
    options?: OptionsObject | undefined
  ) => SnackbarKey,
  setTags: React.Dispatch<React.SetStateAction<string[]>>
) {
  setTags([]);
  try {
    const response = await axios.get(`/api/v1/recipes/${recipeId}/tags`);
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error("Invalid response from server.");
    }
    setTags(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.data.message) {
        enqueueSnackbar(error.response.data.message, {
          variant: "error",
        });
      } else {
        console.error(error);
        enqueueSnackbar(error.message, { variant: "error" });
      }
    } else {
      console.error(error);
      enqueueSnackbar("An error occurred when trying to find the recipe.", {
        variant: "error",
      });
    }
  }
}

async function GetRecipe(
  recipeId: string,
  enqueueSnackbar: (
    message: SnackbarMessage,
    options?: OptionsObject | undefined
  ) => SnackbarKey,
  setRecipe: React.Dispatch<React.SetStateAction<Reply.Recipe | null>>
) {
  setRecipe(null);
  try {
    const response = await axios.get(`/api/v1/recipes/${recipeId}`);
    if (!response.data || !response.data.id) {
      throw new Error("Invalid response from server.");
    }
    setRecipe(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.data.message) {
        enqueueSnackbar(error.response.data.message, {
          variant: "error",
        });
      } else {
        console.error(error);
        enqueueSnackbar(error.message, { variant: "error" });
      }
    } else {
      console.error(error);
      enqueueSnackbar("An error occurred when trying to find the recipe.", {
        variant: "error",
      });
    }
  }
}

const Initialize = (
  recipeBookId: string,
  recipeId: string,
  enqueueSnackbar: (
    message: SnackbarMessage,
    options?: OptionsObject | undefined
  ) => SnackbarKey,
  setRecipe: React.Dispatch<React.SetStateAction<Reply.Recipe | null>>,
  setTags: React.Dispatch<React.SetStateAction<string[]>>,
  setNewRecipe: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (recipeId === "new") {
    setNewRecipe(true);
    const recipe: Reply.Recipe = {
      id: "",
      recipeBookId: recipeBookId,
      name: "",
      ingredients: [],
      steps: [],
      notes: "",
      servings: 0,
      time: 0,
      author: "",
      created_at: new Date(),
    };

    setRecipe(recipe);
  } else {
    GetRecipe(recipeId, enqueueSnackbar, setRecipe);
    GetTags(recipeId, enqueueSnackbar, setTags);
  }
};

export default function MakeRecipe() {
  const [recipeBookId, setRecipeBookId] = React.useState<string>(
    window.location.pathname.split("/")[3]
  );
  const [recipeId, setRecipeId] = React.useState<string>(
    window.location.pathname.split("/")[5]
  );

  const { enqueueSnackbar } = useSnackbar();

  const [newRecipe, setNewRecipe] = React.useState<boolean>(false);
  const [recipe, setRecipe] = React.useState<Reply.Recipe | null>(null);
  const [tags, setTags] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!recipeId || !recipeBookId) {
      enqueueSnackbar("Invalid URL.", {
        variant: "error",
      });
      return;
    }

    Initialize(
      recipeBookId,
      recipeId,
      enqueueSnackbar,
      setRecipe,
      setTags,
      setNewRecipe
    );
  }, [recipeId]);

  return <div>MakeRecipe</div>;
}
