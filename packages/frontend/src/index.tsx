import * as React from "react";
import { createRoot } from "react-dom/client";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import useTheme from "@mui/material/styles/useTheme";
import "./css/common.css";
import customTheme from "./Theme";
import { SnackbarProvider } from "notistack";
import useMediaQuery from "@mui/material/useMediaQuery";
import Router from "./Router";
import AppContext from "./AppContext";
import Access from "./Access";

const Root = () => {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <ThemeProvider theme={customTheme}>
      <SnackbarProvider dense={mobile} maxSnack={3}>
        <AppContext>
          <Access />
          <Router />
        </AppContext>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

const container = document.getElementById("app");
if (!container) throw new Error("No container found");
const root = createRoot(container);
root.render(<Root />);
