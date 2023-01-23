import { Container } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import axios, { AxiosResponse } from "axios";
import { useSnackbar } from "notistack";
import * as React from "react";
import FAB from "./components/FAB";
import MenuBar from "./components/menu-bar/MenuBar";
import Recipe from "./components/recipe/Recipe";

type Recipe = {
  id: string;
  recipeBookId: string;
  name: string;
  time: number;
  servings: number;
  author: string;
  favourite: boolean;
  tags: string[];
};

export default function Book() {
  const recipeBookId = window.location.pathname.split("/")[2];
  const [recipeBook, setRecipeBook] = React.useState<Reply.RecipeBook | null>(
    null
  );
  const [loading, setLoading] = React.useState(true);
  const [recipes, setRecipes] = React.useState<Recipe[]>([]);
  const [searchValue, setSearchValue] = React.useState("");
  const { enqueueSnackbar } = useSnackbar();

  const onSearchChange = (value: string) => {
    setSearchValue(value);
  };

  React.useEffect(() => {
    (async () => {
      try {
        const response = await axios.get<
          any,
          AxiosResponse<Reply.RecipeBook>,
          any
        >(`/api/v1/recipeBooks/${recipeBookId}`);
        setRecipeBook(response.data);
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
          enqueueSnackbar(
            "An error occurred when trying to get the recipe book.",
            { variant: "error" }
          );
        }
        setLoading(false);
      }
    })();
  }, [recipeBookId]);

  return (
    <Box>
      <MenuBar
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        title={recipeBook?.name ?? ""}
      />
      <FAB />
      <Container sx={{ pt: 2, overflowY: "auto" }}>
        <Grid container justifyContent={"space-around"}>
          <Recipe name="Test" onClick={() => {}} />
        </Grid>
      </Container>
    </Box>
  );
}
