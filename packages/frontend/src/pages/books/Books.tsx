import { Box, Container } from "@mui/material";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2";
import axios, { AxiosResponse } from "axios";
import { useSnackbar } from "notistack";
import * as React from "react";
import { UserContext } from "../..";
import AddDialog from "./components/add-dialog/AddDialog";

import Book from "./components/book/Book";
import BookSkeleton from "./components/BookSkeleton";
import LogoutButton from "./components/LogoutButton";
import Title from "./components/Title";
const AddImage = new URL("../../public/AddImage.svg", import.meta.url).href;

export default function Books() {
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useContext(UserContext);
  const [books, setBooks] = React.useState<Reply.RecipeBook[]>([]);
  const [openAddDialog, setOpenAddDialog] = React.useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const GetBooks = () => {
    if (!user) return;
    console.log(user);
    setLoading(true);
    setBooks([]);

    const OnResponse = (response: AxiosResponse<Reply.RecipeBook["id"][]>) => {
      const { data: ids } = response;
      try {
        const promises = ids.map((id) =>
          axios.get(`/api/v1/recipeBooks/${id}`)
        );
        axios.all(promises).then((responses) => {
          const books = responses.map((response) => response.data);
          setBooks(books);
          setLoading(false);
        });
      } catch (error) {
        OnError(error);
      }
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
          "An error occurred when trying to find your recipe books.",
          { variant: "error" }
        );
      }
      setLoading(false);
    };

    axios
      .get(`/api/v1/users/${user.userId}/recipeBooks`)
      .then(OnResponse)
      .catch(OnError);
  };

  React.useEffect(() => {
    GetBooks();
  }, [user]);

  const OpenAddBookDialog = () => {
    setOpenAddDialog(true);
  };

  const CloseAddBookDialog = () => {
    setOpenAddDialog(false);
  };

  const OnBookAdd = (recipeBook: Reply.RecipeBook) => {
    setBooks([...books, recipeBook]);
  };

  return (
    <Box>
      <AddDialog
        onAdd={OnBookAdd}
        open={openAddDialog}
        onClose={CloseAddBookDialog}
      />
      <LogoutButton />
      <Container maxWidth="md" sx={{ pt: 10, pb: 10 }}>
        <Grid container justifyContent={"center"} alignItems={"center"}>
          <Title />
        </Grid>
        <Grid gap={4} container justifyContent={"center"} direction="column">
          {loading ? (
            <>
              <BookSkeleton />
              <BookSkeleton />
              <BookSkeleton />
            </>
          ) : (
            <>
              {books.map((book) => (
                <Book
                  key={book.id}
                  bookId={book.id}
                  name={book.name}
                  onClick={() => {
                    window.location.href = `/book/${book.id}`;
                  }}
                />
              ))}
              <Book
                imageSrc={AddImage}
                name={"Add a Recipe Book"}
                onClick={OpenAddBookDialog}
              />
            </>
          )}
        </Grid>
      </Container>
    </Box>
  );
}
