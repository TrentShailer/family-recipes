import { Backdrop, CircularProgress, Container } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import axios, { AxiosResponse } from "axios";
import { useSnackbar } from "notistack";
import * as React from "react";
import FAB from "./components/FAB";
import MenuBar from "./components/menu-bar/MenuBar";
import Pagination from "./components/pagination/Pagination";
import RecipesPerPage from "./components/pagination/RecipesPerPage";
import Recipe from "./components/recipe/Recipe";

export default function Book() {
  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    let page = searchParams.get("page");
    if (page) {
      setPage(parseInt(page) ?? 1);
    }

    let recipesPerPage = searchParams.get("recipesPerPage");
    const validRecipesPerPage = [4, 8, 16, 32];
    if (recipesPerPage) {
      if (validRecipesPerPage.includes(parseInt(recipesPerPage))) {
        setRecipesPerPage(parseInt(recipesPerPage) ?? 8);
      } else {
        searchParams.set("recipesPerPage", "8");
        window.history.replaceState({}, "", "?" + searchParams.toString());
      }
    }

    let search = searchParams.get("search");
    if (search) {
      setSearchValue(search);
    }
  }, []);

  const [recipeBook, setRecipeBook] = React.useState<Reply.RecipeBook | null>(
    null
  );
  const [loading, setLoading] = React.useState<boolean>(true);
  const [recipeIds, setRecipeIds] = React.useState<Reply.Recipe["id"][]>([]);

  const [recipeBookId, setRecipeBookId] = React.useState<string>(
    window.location.pathname.split("/")[2]
  );
  const [page, setPage] = React.useState<number>(1);

  const [pageCount, setPageCount] = React.useState<number>(1);
  const [recipesPerPage, setRecipesPerPage] = React.useState<number>(8);
  const [searchValue, setSearchValue] = React.useState("");
  const { enqueueSnackbar } = useSnackbar();

  const onSearchChange = (value: string) => {
    setSearchValue(value);
  };

  React.useEffect(() => {
    const OnResponse = (response: AxiosResponse<Reply.RecipeBook>) => {
      const data = response.data;
      if (!data.id || !data.name) {
        throw new Error("Invalid response from server.");
      }
      setRecipeBook(data);
    };

    const OnError = (error: any) => {
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
          "An error occurred when trying to find the recipe book.",
          {
            variant: "error",
          }
        );
      }
    };

    axios
      .get(`/api/v1/recipeBooks/${recipeBookId}`)
      .then(OnResponse)
      .catch(OnError);
  }, [recipeBookId]);

  React.useEffect(() => {
    window.history.replaceState(
      {},
      "",
      `?page=${page}&recipesPerPage=${recipesPerPage}&search=${searchValue}`
    );
    setLoading(true);
    setRecipeIds([]);
    const OnResponse = (
      response: AxiosResponse<{
        recipeIds: Reply.Recipe["id"][];
        recipeCount: number;
      }>
    ) => {
      const data = response.data;
      if (!data.recipeIds || !data.recipeCount) {
        throw new Error("Invalid response from server.");
      }
      setRecipeIds(data.recipeIds);
      setPageCount(Math.ceil(data.recipeCount / recipesPerPage));
      setLoading(false);
    };

    const OnError = (error: any) => {
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.data.message) {
          enqueueSnackbar(error.response.data.message, { variant: "error" });
        } else {
          console.error(error);
          enqueueSnackbar(error.message, { variant: "error" });
        }
      } else {
        console.error(error);
        enqueueSnackbar("An error occurred when trying to find the recipes.", {
          variant: "error",
        });
      }
      setLoading(false);
    };

    axios
      .get(`/api/v1/recipeBooks/${recipeBookId}/recipes`, {
        params: {
          search: searchValue,
          page: page,
          recipesPerPage: recipesPerPage,
        },
      })
      .then(OnResponse)
      .catch(OnError);
  }, [recipeBookId, searchValue, page, recipesPerPage]);

  return (
    <Box>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <MenuBar
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        title={recipeBook?.name ?? ""}
      />
      <FAB />
      <Box sx={{ p: 4 }}>
        <Container>
          <RecipesPerPage
            recipesPerPage={recipesPerPage}
            setRecipesPerPage={setRecipesPerPage}
          />
        </Container>

        <Grid container justifyContent={"center"} gap={4} sx={{ pt: 4, pb: 4 }}>
          {recipeIds.map((recipeId) => (
            <Recipe key={recipeId} recipeId={recipeId} />
          ))}
        </Grid>
        <Grid container justifyContent={"center"}>
          <Pagination page={page} pageCount={pageCount} setPage={setPage} />
        </Grid>
      </Box>
    </Box>
  );
}
