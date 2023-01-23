import { Box } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import axios, { AxiosResponse } from "axios";
import { useSnackbar } from "notistack";
import * as React from "react";
const NotFoundImage = new URL(
  "../../../../public/404Image.svg",
  import.meta.url
);

type Props = {
  bookId: string;
};

export default function Image(props: Props) {
  const [loading, setLoading] = React.useState(true);
  const [image, setImage] = React.useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  React.useEffect(() => {
    setLoading(true);
    setImage(null);

    const OnResponse = (response: AxiosResponse<string | null>) => {
      const recipeId = response.data;
      if (
        recipeId === null ||
        !recipeId.match(
          /\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/
        )
      ) {
        setImage(NotFoundImage.href);
        setLoading(false);
        return;
      }

      setImage(`/api/v1/recipes/${recipeId}/image`);
      setLoading(false);
    };

    const OnError = (error: any) => {
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
        enqueueSnackbar("An error occurred when trying to log you in.", {
          variant: "error",
        });
      }
    };

    axios
      .get(`/api/v1/recipeBooks/${props.bookId}/image`)
      .then(OnResponse)
      .catch(OnError);
  }, [props.bookId]);
  return (
    <Box width={200} height={150}>
      {loading || image === null ? (
        <Skeleton
          animation="pulse"
          variant="rounded"
          width={200}
          height={150}
        />
      ) : (
        <img
          width={200}
          height={150}
          style={{ objectFit: "cover", borderRadius: 5 }}
          src={image}
        />
      )}
    </Box>
  );
}
