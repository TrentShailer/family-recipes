import Box from "@mui/material/Box";
import grey from "@mui/material/colors/grey";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useTheme } from "@mui/material/styles";
import * as React from "react";
import Grid from "@mui/material/Grid";
import Image from "./DesktopImage";
import Typography from "@mui/material/Typography";
import { Chip, Link, Skeleton, Tooltip } from "@mui/material";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import DesktopRecipeSkeleton from "./DesktopRecipeSkeleton";
import { PageContext } from "../../../../AppContext";
type Props = {
  recipeId: string;
};

export default function DesktopRecipe(props: Props) {
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
        const data = response.data;
        if (!data.id) {
          throw new Error("Invalid Response from Server.");
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
        container={true}
        gap={4}
        alignItems="center"
        justifyContent="left"
        direction="row"
        wrap="nowrap"
        height={"min(150px, 22.5vw)"}
        width={"min(750px, 90vw)"}
        sx={{
          background: backgroundColor,
          borderRadius: 1,
          transition: "background 300ms",
        }}
      >
        <Image recipeId={props.recipeId} />

        <Grid height={"100%"} width={"100%"} sx={{ pt: 1, pb: 1, pr: 2 }}>
          {recipe ? (
            <Box>
              <Grid
                columns={24}
                gap={1}
                direction="row"
                container
                justifyContent={"space-between"}
              >
                <Grid xs={18}>
                  <Tooltip arrow placement="top" title={recipe.name}>
                    <Typography
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
                </Grid>
                <Grid xs={5}>
                  <Typography variant="caption">{recipe.author}</Typography>
                  <Grid container direction="row">
                    <AccessAlarmIcon fontSize="small" />
                    <Typography sx={{ ml: 1 }} variant="body1">
                      {recipe.time}m
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid
                sx={{ mt: 1 }}
                height={64}
                overflow="auto"
                container
                gap={1}
              >
                {tags.map((tag) => (
                  <Chip size={"small"} label={tag} />
                ))}
              </Grid>
            </Box>
          ) : (
            <DesktopRecipeSkeleton />
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
