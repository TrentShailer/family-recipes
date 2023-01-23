import { IconButton, Toolbar, Typography } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import * as React from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Search from "./Search";
import HelpTooltip from "./HelpTooltip";
type Props = {
  title: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
};

export default function MenuBar(props: Props) {
  return (
    <AppBar color="appBar" position="static">
      <Toolbar>
        <IconButton size="large" edge="start" color="inherit" sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h6"
          noWrap
          sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
        >
          {props.title}
        </Typography>
        <HelpTooltip />
        <Search value={props.searchValue} onChange={props.onSearchChange} />
      </Toolbar>
    </AppBar>
  );
}
