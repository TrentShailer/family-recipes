import axios, { AxiosResponse } from "axios";
import { useSnackbar } from "notistack";
import * as React from "react";
import { PageContext, UserContext } from "./AppContext";
import Forbidden from "./pages/403/403";

export default function Access() {
  const [user, setUser] = React.useContext(UserContext);
  const [page, setPage] = React.useContext(PageContext);
  const { enqueueSnackbar } = useSnackbar();

  // Find if the user has permission to access the page
  const HandlePageAccess = async (newPage: string) => {
    try {
      await axios.get("/api/v1/page", {
        params: {
          page: newPage,
        },
      });
    } catch (error) {
      // if they dont have permission and the user is not logged in, redirect to login page
      if (!user) {
        setPage("/authenticate");
      } else {
        setPage("/403");
      }
    }
  };

  // on page change verify access to page
  React.useEffect(() => {
    HandlePageAccess(page);
  }, [page]);

  // on page load, get the user session
  React.useEffect(() => {
    if (user) return;
    const GetSession = async () => {
      try {
        const response = await axios.get("/api/v1/session");
        const { data } = response;
        const { userId, name } = data;
        if (!userId || !name) throw new Error("Invalid response from server.");
        setUser({ userId, name });
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status ?? 500;
          switch (status) {
            case 401:
              break;
            case 403:
              break;
            case 404:
              break;
            default:
              enqueueSnackbar(
                "An error occurred while trying to get your session.",
                { variant: "error" }
              );
          }
        } else {
          console.error(error);
          enqueueSnackbar(
            "An error occurred when trying to get your session.",
            { variant: "error" }
          );
        }
      }
    };
    GetSession();
  }, []);

  // on window focus check if the user has access to the page
  // only if the page is not the login page, 403 page, or 404 page
  const onFocus = () => {
    if (page === "/authenticate" || page === "/403" || page === "/404") {
      return;
    }

    HandlePageAccess(page);
  };

  // on page load add event listener to check if the user has access to the page when the window is focused
  React.useEffect(() => {
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return <></>;
}
