import { Box, Fab } from "@mui/material";
import * as React from "react";
import PostAddIcon from "@mui/icons-material/PostAdd";
import { PageContext } from "../../../AppContext";

export default function FAB() {
  const [page, setPage] = React.useContext(PageContext);
  return (
    <Fab
      sx={{
        position: "absolute",
        right: 30,
        bottom: 30,
      }}
      color="primary"
      onClick={() => {
        setPage("/recipe/create");
      }}
    >
      <PostAddIcon />
    </Fab>
  );
}
