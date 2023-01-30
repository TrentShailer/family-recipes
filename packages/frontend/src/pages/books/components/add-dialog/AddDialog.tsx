import { TextField } from "@mui/material";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import * as React from "react";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { useSnackbar } from "notistack";
import { PageContext, UserContext } from "../../../../AppContext";
import axios, { Axios, AxiosResponse } from "axios";

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (recipeBook: Reply.RecipeBook) => void;
};

const ValidInputs = (name: string, password: string): string | true => {
  if (!name || name.length === 0) {
    return "Name is required.";
  }
  if (!password || password.length === 0) {
    return "Password is required.";
  }
  return true;
};

export default function AddDialog(props: Props) {
  const [page, setPage] = React.useContext(PageContext);
  const [user, setUser] = React.useContext(UserContext);
  const [name, setName] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();

  const Close = () => {
    setName("");
    setPassword("");
    setLoading(false);
    props.onClose();
  };

  const Join = () => {
    if (!user) {
      setPage("/authenticate");
      return;
    }
    setLoading(true);
    const validInputs = ValidInputs(name, password);

    if (validInputs !== true) {
      enqueueSnackbar(validInputs, { variant: "error" });
      setLoading(false);
      return;
    }

    const OnResponse = (response: AxiosResponse<Reply.RecipeBook>) => {
      if (!response.data || !response.data.id) {
        throw new Error("Invalid response from server.");
      }
      props.onAdd(response.data);
      Close();
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
          "An error occurred when trying to join the recipe book.",
          {
            variant: "error",
          }
        );
      }
      setLoading(false);
    };

    axios
      .post(`/api/v1/users/${user.userId}/recipeBooks`, {
        name,
        password,
      })
      .then(OnResponse)
      .catch(OnError);
  };

  const Create = () => {
    if (!user) {
      setPage("/authenticate");
      return;
    }
    setLoading(true);
    const validInputs = ValidInputs(name, password);

    if (validInputs !== true) {
      enqueueSnackbar(validInputs, { variant: "error" });
      setLoading(false);
      return;
    }

    const OnResponse = (response: AxiosResponse<Reply.RecipeBook>) => {
      if (!response.data || !response.data.id) {
        throw new Error("Invalid response from server.");
      }
      props.onAdd(response.data);
      Close();
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
          "An error occurred when trying to create the recipe book.",
          {
            variant: "error",
          }
        );
      }
      setLoading(false);
    };

    axios
      .post(`/api/v1/recipeBooks`, {
        name,
        password,
      })
      .then(OnResponse)
      .catch(OnError);
  };

  return (
    <Dialog fullWidth maxWidth={"sm"} open={props.open} onClose={Close}>
      <DialogTitle>Add a Recipe Book</DialogTitle>
      <DialogContent>
        <Box component={"form"}>
          <Grid
            container
            spacing={2}
            direction="column"
            justifyContent="center"
          >
            <Grid>
              <TextField
                autoFocus
                required
                label="Name"
                fullWidth
                variant="filled"
                value={name}
                helperText="Name is case sensitive"
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>
            <Grid>
              <TextField
                required
                label="Password"
                type="password"
                fullWidth
                variant="filled"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Grid
          container
          gap={4}
          justifyContent={"center"}
          width="100%"
          sx={{ pb: 1 }}
        >
          <Button
            size="large"
            variant="contained"
            color="cancel"
            endIcon={<RemoveCircleIcon />}
            onClick={Close}
          >
            Cancel
          </Button>
          <Button
            size="large"
            variant="contained"
            color="register"
            endIcon={<BookmarkAddIcon />}
            onClick={Create}
          >
            Create New
          </Button>
          <Button
            size="large"
            variant="contained"
            color="login"
            endIcon={<AddCircleIcon />}
            onClick={Join}
          >
            Join Existing
          </Button>
        </Grid>
      </DialogActions>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Dialog>
  );
}
