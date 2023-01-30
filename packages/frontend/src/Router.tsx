import * as React from "react";
import { PageContext, TitleContext, UserContext } from "./AppContext";
import Forbidden from "./pages/403/403";
import NotFound from "./pages/404/404";
import Authenticate from "./pages/authenticate/Authenticate";
import Book from "./pages/book/Book";
import Books from "./pages/books/Books";
import MakeRecipe from "./pages/make-recipe/MakeRecipe";
import Recipe from "./pages/recipe/Recipe";

type Page = {
  path: RegExp;
  element: React.ReactElement;
  title: string;
  cacheable: boolean;
};

const pages: Page[] = [
  {
    path: /^\/authenticate(|\?lastPage=.*)$/,
    element: <Authenticate />,
    title: "Family Recipes - Authenticate",
    cacheable: false,
  },
  {
    path: /^\/books$/,
    element: <Books />,
    title: "Family Recipes - View Books",
    cacheable: true,
  },
  {
    path: /^\/books\/[^\/]+$/,
    element: <Book />,
    title: "Family Recipes - View Recipes",
    cacheable: true,
  },
  {
    path: /^\/recipe\/[^\/]+$/,
    element: <Recipe />,
    title: "Family Recipes - View  Recipe",
    cacheable: true,
  },
  {
    path: /^\/edit\/books\/[^\/]+\/recipe\/[^\/]+$/,
    element: <MakeRecipe />,
    title: "Family Recipes - Edit Recipe",
    cacheable: false,
  },
  {
    path: /^\/403$/,
    element: <Forbidden />,
    title: "Family Recipes - Forbidden",
    cacheable: false,
  },
  {
    path: /^\/404$/,
    element: <NotFound />,
    title: "Family Recipes - Not Found",
    cacheable: false,
  },
];

export default function Router() {
  const [element, setElement] = React.useState<React.ReactElement>(<></>);
  const [page, setPage] = React.useContext(PageContext);
  const [title, setTitle] = React.useContext(TitleContext);
  const [user, setUser] = React.useContext(UserContext);

  const HandleNoPath = () => {
    if (user) {
      const lastPage = window.localStorage.getItem("page");
      if (lastPage) {
        setPage(lastPage);
      } else {
        setPage("/books");
      }
    } else {
      setPage("/authenticate");
    }
  };

  // handle page change
  React.useEffect(() => {
    if (!page || page === "/") {
      HandleNoPath();
      return;
    }

    // remove trailing slash
    if (page.endsWith("/")) {
      setPage(page.slice(0, -1));
      return;
    }

    // try to find a page that matches the current page
    const found = pages.find((p) => p.path.test(page));

    // if a page is found, set the page in local storage, scroll to the top, push the page to the history, set the title, and set the element
    // if a page is not found, set the page to 404
    if (found) {
      if (page !== "/403" && page !== "/404") {
        window.localStorage.setItem("page", page);
      }
      window.scrollTo(0, 0);
      window.history.pushState({}, "", page);
      setTitle(found.title);
      setElement(found.element);
    } else {
      setPage("/404");
    }
  }, [page]);

  React.useEffect(() => {
    document.title = title;
  }, [title]);

  return element;
}
