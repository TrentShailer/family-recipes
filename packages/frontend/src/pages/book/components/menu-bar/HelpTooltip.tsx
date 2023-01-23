import { ClickAwayListener, IconButton, Tooltip } from "@mui/material";
import * as React from "react";
import HelpIcon from "@mui/icons-material/Help";

type Props = {};

export default function HelpTooltip() {
  const [open, setOpen] = React.useState(false);
  return (
    <ClickAwayListener
      onClickAway={() => {
        setOpen(false);
      }}
    >
      <Tooltip
        open={open}
        title="Search filters recipes to ones that include the search text in its title, author, steps, ingredients, notes, or tags."
      >
        <IconButton
          onClick={() => setOpen(!open)}
          size="large"
          edge="start"
          color="inherit"
        >
          <HelpIcon />
        </IconButton>
      </Tooltip>
    </ClickAwayListener>
  );
}
