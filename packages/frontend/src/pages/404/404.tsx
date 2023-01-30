import { Button, Container, Link, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import * as React from "react";
import { PageContext } from "../../AppContext";

export default function NotFound() {
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
        <Typography variant="h1">404</Typography>
        <Typography variant="h2" textAlign={"center"}>
          The page you are looking for does not exist
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
