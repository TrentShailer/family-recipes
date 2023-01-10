import { Container, Paper } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import * as React from "react";
import GlassPaper from "../../../components/GlassPaper";

type Props = {
  children?: any;
};

export default function CenterGlass(props: Props) {
  return (
    <Container maxWidth="sm">
      <Grid
        container
        justifyContent={"center"}
        alignItems={"center"}
        height={"100vh"}
        width={"100%"}
      >
        <GlassPaper
          elevation={12}
          sx={{ p: 3, mt: "-20vh", display: "block", width: "100%" }}
        >
          {props.children}
        </GlassPaper>
      </Grid>
    </Container>
  );
}
