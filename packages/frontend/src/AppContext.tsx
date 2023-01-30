import * as React from "react";
import { useState } from "react";

export const PageContext = React.createContext<
  [string, React.Dispatch<React.SetStateAction<string>>]
>(["", () => {}]);

export const TitleContext = React.createContext<
  [string, React.Dispatch<React.SetStateAction<string>>]
>(["", () => {}]);

export const UserContext = React.createContext<
  [
    Reply.Session | null,
    React.Dispatch<React.SetStateAction<Reply.Session | null>>
  ]
>([null, () => {}]);

export default function AppContext(props: { children: React.ReactNode }) {
  const [user, setUser] = useState<Reply.Session | null>(null);
  const [page, setPage] = useState<string>(
    window.location.pathname + window.location.search
  );
  const [lastPage, setLastPage] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");

  return (
    <TitleContext.Provider value={[title, setTitle]}>
      <PageContext.Provider value={[page, setPage]}>
        <UserContext.Provider value={[user, setUser]}>
          {props.children}
        </UserContext.Provider>
      </PageContext.Provider>
    </TitleContext.Provider>
  );
}
