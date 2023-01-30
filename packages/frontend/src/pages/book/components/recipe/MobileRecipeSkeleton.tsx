import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2";
import * as React from "react";

export default function MobileRecipeSkeleton() {
  return (
    <Box>
      <Grid>
        <Typography variant="h5">
          <Skeleton variant="text" width={"100%"} />
          <Skeleton variant="text" width={"100%"} />
        </Typography>
      </Grid>
      <Grid>
        <Typography variant="caption">
          <Skeleton variant="text" width={"100%"} />
        </Typography>
      </Grid>
      <Grid sx={{ mt: 1 }} container gap={1}>
        <Skeleton variant="rounded" width={50} height={16} />
        <Skeleton variant="rounded" width={130} height={16} />
        <Skeleton variant="rounded" width={75} height={16} />
        <Skeleton variant="rounded" width={120} height={16} />
        <Skeleton variant="rounded" width={60} height={16} />
        <Skeleton variant="rounded" width={105} height={16} />
      </Grid>
      <Grid sx={{ mt: 1 }} container direction="row">
        <Skeleton variant="circular" width={24} height={24} />
        <Typography sx={{ ml: 1 }} variant="body1">
          <Skeleton variant="text" width={50} />
        </Typography>
      </Grid>
    </Box>
  );
}
