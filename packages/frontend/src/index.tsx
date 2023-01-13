import * as React from "react";
import { createRoot } from "react-dom/client";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import useTheme from "@mui/material/styles/useTheme";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Authenticate from "./pages/authenticate/Authenticate";
import Books from "./pages/books/Books";
import Book from "./pages/book/Book";
import Recipe from "./pages/recipe/Recipe";
import "./css/common.css";
import customTheme from "./Theme";
import { SnackbarProvider, useSnackbar } from "notistack";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useState } from "react";
import axios, { AxiosResponse } from "axios";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Authenticate />,
  },
  {
    path: "/books",
    element: <Books />,
  },
  {
    path: "/book/:recipeBookId",
    element: <Book />,
  },
  {
    path: "/recipe/:recipeId",
    element: <Recipe />,
  },
]);

export const UserContext = React.createContext<
  [Reply.User | null, React.Dispatch<React.SetStateAction<Reply.User | null>>]
>([null, () => {}]);

const Root = () => {
  const [user, setUser] = useState<Reply.User | null>(null);
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <ThemeProvider theme={customTheme}>
      <UserContext.Provider value={[user, setUser]}>
        <SnackbarProvider dense={mobile} maxSnack={3}>
          <GetSessionOnLoad />
          <RouterProvider router={router} />
        </SnackbarProvider>
      </UserContext.Provider>
    </ThemeProvider>
  );
};

const GetSessionOnLoad = () => {
  const [user, setUser] = React.useContext(UserContext);
  const { enqueueSnackbar } = useSnackbar();
  React.useEffect(() => {
    if (!user) {
      axios
        .get("/api/v1/session")
        .then((response: AxiosResponse<Reply.User>) => {
          const { data } = response;
          const { id, name } = data;
          setUser({ id, name });
        })
        .catch((error) => {
          if (axios.isAxiosError(error)) {
            switch (error.status) {
              case 401:
                break;
              case 403:
                break;
              case 404:
                break;
              default:
                enqueueSnackbar(
                  "An error occurred while trying to get your session.",
                  { variant: "error" }
                );
            }
          } else {
            if (axios.isAxiosError(error)) {
              switch (error.status) {
                case 404:
                  break;
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
                "An error occurred when trying to get your session.",
                { variant: "error" }
              );
            }
          }
        });
    }
  }, []);

  const onFocus = () => {
    if (window.location.pathname === "/") {
      return;
    }
    axios.get("/api/v1/session").catch((error) => {
      if (axios.isAxiosError(error)) {
        if (error.status === 401 || error.response?.status === 401) {
          window.localStorage.setItem("backLocation", window.location.pathname);
          window.location.href = "/";
          return;
        }
      }
      console.error(error);
      enqueueSnackbar("Failed to get authentication.", {
        variant: "error",
      });
    });
  };

  React.useEffect(() => {
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return <></>;
};

const container = document.getElementById("app");
if (!container) throw new Error("No container found");
const root = createRoot(container);
root.render(<Root />);
