import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Grid, { Grid2Props } from "@mui/material/Unstable_Grid2";
import * as React from "react";
import Image from "./Image";
import Typography from "@mui/material/Typography";
import { grey } from "@mui/material/colors";
import { Box } from "@mui/material";

type Props = {
  name: string;
  bookId?: string;
  imageSrc?: string;
  onClick: React.MouseEventHandler;
};

const ImageElement = (props: Props) => {
  return props.imageSrc || !props.bookId ? (
    <Box width={200} height={150}>
      <img
        width={200}
        height={150}
        style={{ objectFit: "cover", borderRadius: 5 }}
        src={props.imageSrc}
      />
    </Box>
  ) : (
    <Image bookId={props.bookId} />
  );
};

export default function Recipe(props: Props) {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("sm"));
  const [backgroundColor, setBackgroundColor] = React.useState<string>(
    grey[100]
  );
  const [scale, setScale] = React.useState<number>(1);

  const desktopContainerProps: Grid2Props = {
    container: true,
    gap: 4,
    alignItems: "center",
    justifyContent: "left",
    direction: "row",
    wrap: "nowrap",
    height: 150,
    width: "100%",
    sx: {
      background: backgroundColor,
      borderRadius: 1,
      transition: "background 300ms",
    },
  };

  const mobileContainerProps: Grid2Props = {
    container: true,
    alignItems: "center",
    justifyContent: "left",
    direction: "column",
    width: "100%",
    sx: {
      background: backgroundColor,
      borderRadius: 1,
      transition: "background 300ms",
    },
  };

  const [containerProps, setContainerProps] = React.useState<Grid2Props>(
    desktopContainerProps
  );

  React.useEffect(() => {
    if (desktop) {
      setContainerProps(desktopContainerProps);
    } else {
      setContainerProps(mobileContainerProps);
    }
  }, [desktop]);
  return (
    <Box
      sx={{
        cursor: "pointer",
        transform: `scale(${scale})`,
        transition: "transform 300ms",
      }}
      onMouseEnter={() => {
        setBackgroundColor(grey[200]);
        setScale(1.05);
      }}
      onMouseLeave={() => {
        setBackgroundColor(grey[100]);
        setScale(1);
      }}
      onClick={props.onClick}
    >
      <Grid {...containerProps}>
        <ImageElement {...props} />

        <Grid width={"100%"} sx={{ pt: 1, pb: 1, pr: 1 }}>
          <Typography
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
            height={"100%"}
            width={"100%"}
            textAlign={desktop ? "left" : "center"}
            variant="h4"
          >
            {props.name}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
