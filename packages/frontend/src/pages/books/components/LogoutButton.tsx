import { Box, Button, IconButton, SxProps } from "@mui/material";
import * as React from "react";
import LogoutIcon from "@mui/icons-material/Logout";
import axios from "axios";
import { useSnackbar } from "notistack";
import { PageContext, UserContext } from "../../../AppContext";

export default function LogoutButton() {
  const [page, setPage] = React.useContext(PageContext);
  const { enqueueSnackbar } = useSnackbar();
  const [user, setUser] = React.useContext(UserContext);
  const Logout = () => {
    axios
      .delete("/api/v1/session")
      .then(() => {
        setUser(null);
        setPage("/");
        window.localStorage.removeItem("page");
      })
      .catch((error) => {
        if (axios.isAxiosError(error)) {
          switch (error.status) {
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
          enqueueSnackbar("An error occurred when trying to log you out.", {
            variant: "error",
          });
        }
      });
  };
  return (
    <Box sx={{ position: "absolute", left: 20, top: 20 }}>
      <Button
        onClick={Logout}
        color="error"
        size="large"
        startIcon={<LogoutIcon />}
      >
        Logout
      </Button>
    </Box>
  );
}
