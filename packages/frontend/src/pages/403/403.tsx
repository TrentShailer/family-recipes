import { Button, Container, Link, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import * as React from "react";
import { PageContext } from "../../AppContext";

export default function Forbidden() {
  const [page, setPage] = React.useContext(PageContext);
  return (
    <Container>
      <Grid
        direction="column"
        container
        alignItems={"center"}
        justifyContent={"center"}
        gap={4}
        sx={{ mt: 8 }}
      >
        <Typography variant="h1">403</Typography>
        <Typography variant="h2" textAlign={"center"}>
          You are not allowed to access that page.
        </Typography>
        <Button
          variant="text"
          onClick={() => {
            setPage("/");
          }}
        >
          Click Here to go to home
        </Button>
      </Grid>
    </Container>
  );
}
