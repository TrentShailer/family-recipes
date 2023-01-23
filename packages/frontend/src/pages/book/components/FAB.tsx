import { Fab } from "@mui/material";
import * as React from "react";
import PostAddIcon from "@mui/icons-material/PostAdd";

export default function FAB() {
  return (
    <Fab
      sx={{
        position: "absolute",
        right: 30,
        bottom: 30,
      }}
      color="primary"
      onClick={() => {
        window.location.href = "/recipe/create";
      }}
    >
      <PostAddIcon />
    </Fab>
  );
}
