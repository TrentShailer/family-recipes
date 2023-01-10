import React = require("react");
import { createRoot } from "react-dom/client";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Authenticate from "./pages/authenticate/Authenticate";
import Books from "./pages/books/Books";
import Recipes from "./pages/recipes/Recipes";
import Recipe from "./pages/recipe/Recipe";
import "./css/common.css";
import customTheme from "./Theme";
import { SnackbarProvider } from "notistack";
import { useMediaQuery } from "@mui/material";
import { useState } from "react";

const router = createBrowserRouter([
  {
    path: "/auth",
    element: <Authenticate />,
  },
  {
    path: "/books",
    element: <Books />,
  },
  {
    path: "/recipes",
    element: <Recipes />,
  },
  {
    path: "/recipe",
    element: <Recipe />,
  },
]);

type User = {
  id: string;
  name: string;
};

export const UserContext = React.createContext<
  [User | null, React.Dispatch<React.SetStateAction<User | null>>]
>([null, () => {}]);

const Root = () => {
  const [user, setUser] = useState<User | null>(null);
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <ThemeProvider theme={customTheme}>
      <UserContext.Provider value={[user, setUser]}>
        <SnackbarProvider dense={mobile} maxSnack={3}>
          <RouterProvider router={router} />
        </SnackbarProvider>
      </UserContext.Provider>
    </ThemeProvider>
  );
};

const container = document.getElementById("app");
if (!container) throw new Error("No container found");
const root = createRoot(container);
root.render(<Root />);
