import Box from "@mui/material/Box";
import grey from "@mui/material/colors/grey";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Unstable_Grid2";
import axios from "axios";
import { useSnackbar } from "notistack";
import * as React from "react";
import MobileRecipeSkeleton from "./MobileRecipeSkeleton";
import Image from "./MobileImage";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import Chip from "@mui/material/Chip";
import { PageContext } from "../../../../AppContext";

type Props = {
  recipeId: string;
};

export default function MobileRecipe(props: Props) {
  const [page, setPage] = React.useContext(PageContext);
  const [recipe, setRecipe] = React.useState<Reply.Recipe | null>(null);
  const [tags, setTags] = React.useState<string[]>([]);
  const [backgroundColor, setBackgroundColor] = React.useState<string>(
    grey[100]
  );
  const [scale, setScale] = React.useState<number>(1);
  const { enqueueSnackbar } = useSnackbar();

  React.useEffect(() => {
    async function GetTags() {
      try {
        const response = await axios.get(
          `/api/v1/recipes/${props.recipeId}/tags`
        );
        if (!response.data || !Array.isArray(response.data)) {
          throw new Error("Invalid response from server.");
        }
        setTags(response.data);
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
          enqueueSnackbar("An error occurred when trying to find a recipe.", {
            variant: "error",
          });
        }
      }
    }

    async function GetRecipe() {
      setRecipe(null);
      try {
        const response = await axios.get<Reply.Recipe>(
          `/api/v1/recipes/${props.recipeId}`
        );
        if (!response.data || !response.data.id) {
          throw new Error("Invalid response from server.");
        }
        setRecipe(response.data);
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
          enqueueSnackbar("An error occurred when trying to find a recipe.", {
            variant: "error",
          });
        }
      }
    }

    GetTags();
    GetRecipe();
  }, [props.recipeId]);
  return (
    <Box
      component={Link}
      href={`/recipes/${props.recipeId}`}
      underline="none"
      width="100%"
      sx={{
        color: "inherit",
        textDecoration: "none",
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
      onClick={() => {
        setPage(`/recipes/${props.recipeId}`);
      }}
    >
      <Grid
        container
        gap={1}
        direction="column"
        height={"100%"}
        width={"100%"}
        flexWrap={"nowrap"}
        sx={{
          background: backgroundColor,
          borderRadius: 1,
          transition: "background 300ms",
        }}
      >
        <Image recipeId={props.recipeId} />

        <Grid height={"100%"} width={"100%"} sx={{ pl: 1, pb: 1, pr: 2 }}>
          {recipe ? (
            <Box>
              <Grid>
                <Typography variant="h5">
                  <Tooltip arrow placement="top" title={recipe.name}>
                    <Typography
                      textAlign={"center"}
                      variant="h5"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {recipe.name}
                    </Typography>
                  </Tooltip>
                </Typography>
              </Grid>
              <Grid>
                <Typography
                  display={"block"}
                  textAlign={"center"}
                  variant="caption"
                >
                  {recipe.author}
                </Typography>
              </Grid>
              <Grid
                sx={{ mt: 1 }}
                container
                gap={1}
                height={64}
                overflow="auto"
              >
                {tags.map((tag) => (
                  <Chip size={"small"} label={tag} />
                ))}
              </Grid>
              <Grid sx={{ mt: 1 }} container direction="row">
                <AccessAlarmIcon fontSize="small" />
                <Typography sx={{ ml: 1 }} variant="body1">
                  {recipe.time}m
                </Typography>
              </Grid>
            </Box>
          ) : (
            <MobileRecipeSkeleton />
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
