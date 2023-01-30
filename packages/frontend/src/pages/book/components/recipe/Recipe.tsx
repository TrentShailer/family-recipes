import Box from "@mui/material/Box";
import grey from "@mui/material/colors/grey";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useTheme } from "@mui/material/styles";
import * as React from "react";
import Grid from "@mui/material/Grid";
import Image from "./DesktopImage";
import Typography from "@mui/material/Typography";
import { Link, Skeleton, useMediaQuery } from "@mui/material";
import MobileRecipe from "./MobileRecipe";
import DesktopRecipe from "./DesktopRecipe";

type Props = {
  recipeId: string;
};

export default function Recipe(props: Props) {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("sm"));

  return desktop ? <DesktopRecipe {...props} /> : <MobileRecipe {...props} />;
}
