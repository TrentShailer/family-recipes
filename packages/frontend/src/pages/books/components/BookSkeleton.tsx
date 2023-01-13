import * as React from "react";
import Grid from "@mui/material/Unstable_Grid2";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

export default function BookSkeleton() {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("sm"));
  const [loader, setLoader] = React.useState(<></>);

  React.useEffect(() => {
    if (desktop) {
      setLoader(
        <Grid
          container
          gap={4}
          alignItems={"center"}
          justifyContent={"center"}
          direction="row"
        >
          <Grid>
            <Skeleton
              animation="pulse"
              variant="rounded"
              width={200}
              height={150}
            />
          </Grid>
          <Grid width="calc(100% - 200px - 64px)">
            <Typography width={"100%"} variant="h3">
              <Skeleton animation="pulse" variant="text" />
              <Skeleton animation="pulse" variant="text" />
            </Typography>
          </Grid>
        </Grid>
      );
    } else {
      setLoader(
        <Grid
          container
          gap={2}
          alignItems={"center"}
          justifyContent={"center"}
          direction="column"
        >
          <Grid>
            <Skeleton
              animation="pulse"
              variant="rounded"
              width={200}
              height={150}
            />
          </Grid>
          <Grid width="90%">
            <Typography width={"100%"} variant="h3">
              <Skeleton animation="pulse" variant="text" />
              <Skeleton animation="pulse" variant="text" />
            </Typography>
          </Grid>
        </Grid>
      );
    }
  }, [desktop]);
  return <>{loader}</>;
}
