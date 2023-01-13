import { createTheme } from "@mui/material/styles";
import green from "@mui/material/colors/green";
import blue from "@mui/material/colors/blue";
import grey from "@mui/material/colors/grey";

declare module "@mui/material/styles" {
  interface Palette {
    login: Palette["primary"];
    register: Palette["primary"];
  }

  // allow configuration using `createTheme`
  interface PaletteOptions {
    login?: PaletteOptions["primary"];
    register?: PaletteOptions["primary"];
    cancel?: PaletteOptions["primary"];
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    login: true;
    register: true;
    cancel: true;
  }
}

const customTheme = createTheme({
  palette: {
    login: {
      main: green[400],
      contrastText: "#fff",
    },
    register: {
      main: blue[400],
      contrastText: "#fff",
    },
    cancel: {
      main: grey[400],
      contrastText: "#fff",
    },
  },
  typography: {
    h1: {
      fontWeight: 400,
    },
    h2: {
      fontWeight: 400,
    },
    h3: {
      fontWeight: 500,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 600,
    },
    body1: {
      fontWeight: 600,
    },
    body2: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 600,
    },
    subtitle2: {
      fontWeight: 800,
    },
    button: {
      fontWeight: 800,
    },
    caption: {
      fontWeight: 600,
    },
    overline: {
      fontWeight: 600,
    },
    fontFamily: [
      "quicksand",
      "Roboto",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
  },
});

export default customTheme;
