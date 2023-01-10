import { styled, TextField, TextFieldProps } from "@mui/material";
import * as React from "react";

const GlassTextField = styled(TextField)<TextFieldProps>(({ theme }) => ({
  "& label": {
    color: "#fff",
  },
  "& label.Mui-focused": {
    color: "#fff",
  },
  "& .MuiInputBase-input": {
    color: "#000",
  },
  "& .MuiInputBase-root.MuiFilledInput-root": {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  "& .MuiInputBase-root.MuiFilledInput-root:after": {
    borderBottomColor: "#fff",
  },
  "& .MuiInputBase-root.MuiFilledInput-root:before": {
    borderBottomColor: "rgba(255, 255, 255, 0.25)",
  },
  "& .MuiFormHelperText-root": {
    color: "#000",
  },
}));

export default GlassTextField;
