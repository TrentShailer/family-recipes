import * as React from "react";
import MUIPagination from "@mui/material/Pagination";

type Props = {
  pageCount: number;
  page: number;
  setPage: (page: number) => void;
};

export default function Pagination(props: Props) {
  return (
    <MUIPagination
      count={props.pageCount}
      page={props.page}
      onChange={(event, value: number) => {
        props.setPage(value);
      }}
      size={"large"}
      showFirstButton
      showLastButton
    />
  );
}
