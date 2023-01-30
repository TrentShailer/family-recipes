import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import * as React from "react";

type Props = {
  recipesPerPage: number;
  setRecipesPerPage: (recipesPerPage: number) => void;
};

export default function RecipesPerPage(props: Props) {
  return (
    <FormControl sx={{ m: 1, minWidth: 140 }}>
      <InputLabel>Recipes per page</InputLabel>
      <Select
        value={props.recipesPerPage}
        onChange={(event) => {
          props.setRecipesPerPage(event.target.value as number);
        }}
        label="Recipes per page"
      >
        <MenuItem value={4}>4</MenuItem>
        <MenuItem value={8}>8</MenuItem>
        <MenuItem value={16}>16</MenuItem>
        <MenuItem value={32}>32</MenuItem>
      </Select>
    </FormControl>
  );
}
