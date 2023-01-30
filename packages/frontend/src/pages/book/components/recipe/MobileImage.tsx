import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import axios from "axios";
import { useSnackbar } from "notistack";
import * as React from "react";
const NotFoundImage = new URL(
  "../../../../public/404Image.svg",
  import.meta.url
);

type Props = {
  recipeId: string;
};

export default function DesktopImage(props: Props) {
  const [imageSrc, setImageSrc] = React.useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  React.useEffect(() => {
    async function GetImage() {
      setImageSrc(null);
      try {
        const response = await axios.get(
          `/api/v1/recipes/${props.recipeId}/image`
        );
        if (response.data.length === 0) {
          throw new Error("Invalid response from server.");
        }
        setImageSrc(
          URL.createObjectURL(new Blob([response.data], { type: "image/jpeg" }))
        );
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response && error.response.data.message) {
            enqueueSnackbar(error.response.data.message, {
              variant: "error",
            });
          } else {
            console.error(error);
            enqueueSnackbar(error.message, { variant: "error" });
          }
        } else {
          console.error(error);
          enqueueSnackbar("An error occurred when trying to a recipes image.", {
            variant: "error",
          });
        }
      }
      setImageSrc(NotFoundImage.href);
    }

    GetImage();
  }, [props.recipeId]);

  return (
    <Grid width={"100%"} container justifyContent={"center"}>
      {imageSrc === null ? (
        <Skeleton
          animation="pulse"
          variant="rounded"
          height={150}
          width={"66%"}
        />
      ) : (
        <img
          height={"100%"}
          width={"66%"}
          style={{ objectFit: "cover", borderRadius: 5 }}
          src={imageSrc}
        />
      )}
    </Grid>
  );
}
