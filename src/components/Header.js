import React from "react";
import { Box, Typography } from "@mui/material";

const Header = ({ showSubtitle = true }) => {
  const headerStyle = {
    textAlign: "center",
    marginBottom: { xs: "5px", sm: "10px", md: "15px" },
    backgroundColor: "white",
    borderTopLeftRadius: "0px",
    borderTopRightRadius: "0px",
    borderBottomLeftRadius: "16px",
    borderBottomRightRadius: "16px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    padding: { xs: "3px", sm: "4px", md: "8px", lg: "12px" },
  };

  return (
    <Box sx={headerStyle}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          color: "#1E293B",
          fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
        }}
      >
        لعبة الحروف العربية
      </Typography>
      {showSubtitle && (
        <Typography
          variant="h6"
          sx={{
            color: "#6B7280",
            fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
          }}
        >
          كون مسار متصل للفوز!
        </Typography>
      )}
    </Box>
  );
};

export default Header;
