import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import * as React from "react";

type Recipe = {
	id: string;
	recipeBookId: string;
	name: string;
	time: number;
	servings: number;
	author: string;
	favourite: boolean;
	tags: string[];
}

export default function Book() {
	const recipeBookId = window.location.pathname.split("/")[2];
  const [loading, setLoading] = React.useState(true);
	const [recipes, setRecipes] = React.useState<Recipe[]>([]);

  return <Box>Book</Box>;
}
