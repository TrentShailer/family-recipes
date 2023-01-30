import Typography from "@mui/material/Typography";
import * as React from "react";
import { UserContext } from "../../../AppContext";

export default function Title() {
  const [user, setUser] = React.useContext(UserContext);
  const [greeting, setGreeting] = React.useState("Good Evening");
  React.useEffect(() => {
    const date = new Date();
    const hour = date.getHours();
    if (hour < 12) {
      setGreeting("Good Morning");
    } else if (hour < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }
  }, []);
  return (
    <Typography textAlign={"center"} sx={{ mb: 4 }} variant="h3">
      {user && user.name ? `${greeting} ${user.name}!` : `${greeting}!`}
    </Typography>
  );
}
