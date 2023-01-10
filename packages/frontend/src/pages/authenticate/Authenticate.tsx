import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import * as React from "react";
import GlassTextField from "../../components/GlassInput";
import CenterGlass from "./components/CenterGlass";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LoginIcon from "@mui/icons-material/Login";
import { useState } from "react";
import axios from "axios";
import { useSnackbar } from "notistack";
import { UserContext } from "../..";

const ValidInputs = (name: string, password: string): string | true => {
  if (!name || name.length === 0) {
    return "Name is required.";
  }
  if (!password || password.length === 0) {
    return "Password is required.";
  }
  return true;
};

export default function Authenticate() {
  const [user, setUser] = React.useContext(UserContext);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const TryRegister = () => {
    setLoading(true);
    const validInputs = ValidInputs(name, password);

    if (validInputs !== true) {
      enqueueSnackbar(validInputs, { variant: "error" });
      setLoading(false);
      return;
    }

    axios
      .post("/api/v1/users", {
        name,
        password,
      })
      .then((response) => {
        const { data } = response;
        const { id, name } = data;
        setUser({ id, name });
        const backLocation = localStorage.getItem("backLocation");
        if (backLocation) {
          localStorage.removeItem("backLocation");
          window.location.href = backLocation;
        } else {
          window.location.href = "/books";
        }
      })
      .catch((error) => {
        if (axios.isAxiosError(error)) {
          switch (error.status) {
            case 409:
            case 500:
              if (error.response && error.response.data.message) {
                enqueueSnackbar(error.response.data.message, {
                  variant: "error",
                });
                break;
              }
            default:
              console.error(error);
              enqueueSnackbar(error.message, { variant: "error" });
          }
        } else {
          console.error(error);
          enqueueSnackbar(
            "An error occurred when trying to create your account.",
            { variant: "error" }
          );
        }
        setLoading(false);
      });
  };

  const TryLogin = () => {
    setLoading(true);
    const validInputs = ValidInputs(name, password);

    if (validInputs !== true) {
      enqueueSnackbar(validInputs, { variant: "error" });
      setLoading(false);
      return;
    }
    axios
      .post("/api/v1/session", {
        name,
        password,
      })
      .then((response) => {
        const { data } = response;
        const { id, name } = data;
        setUser({ id, name });
        const backLocation = localStorage.getItem("backLocation");
        if (backLocation) {
          localStorage.removeItem("backLocation");
          window.location.href = backLocation;
        } else {
          window.location.href = "/books";
        }
      })
      .catch((error) => {
        if (axios.isAxiosError(error)) {
          switch (error.status) {
            case 401:
            case 500:
              if (error.response && error.response.data.message) {
                enqueueSnackbar(error.response.data.message, {
                  variant: "error",
                });
                break;
              }
            default:
              console.error(error);
              enqueueSnackbar(error.message, { variant: "error" });
          }
        } else {
          console.error(error);
          enqueueSnackbar("An error occurred when trying to log you in.", {
            variant: "error",
          });
        }
        setLoading(false);
      });
  };

  return (
    <div className="body">
      <CenterGlass>
        <Typography textAlign={"center"} color="#fff" variant="h4">
          Family Recipes
        </Typography>
        <Box component="form" autoComplete="off" sx={{ mt: 2 }} width={"100%"}>
          <Grid
            container
            spacing={2}
            direction="column"
            justifyContent="center"
          >
            <Grid>
              <GlassTextField
                required
                label="Name"
                fullWidth
                variant="filled"
                value={name}
                helperText="^ Case sensitive"
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>
            <Grid>
              <GlassTextField
                required
                label="Password"
                type="password"
                fullWidth
                variant="filled"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Grid>

            <Grid sx={{ mt: 2, mb: 1 }}>
              <Grid container justifyContent={"space-around"}>
                <Button
                  variant="contained"
                  size="large"
                  color="register"
                  startIcon={<PersonAddIcon />}
                  onClick={TryRegister}
                >
                  Register
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  color="login"
                  endIcon={<LoginIcon />}
                  onClick={TryLogin}
                >
                  Login
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Box>
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </CenterGlass>
    </div>
  );
}
