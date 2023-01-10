import { Paper, PaperProps, styled } from "@mui/material";
import * as React from "react";

const GlassPaper = styled(Paper)<PaperProps>(({ theme }) => ({
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  backdropFilter: "blur(20px)",
}));

export default GlassPaper;
