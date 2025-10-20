import React from "react";
import { Box } from "@mui/material";

const HexCell = ({ letter, owner, onClick }) => {
  const getCellStyle = () => {
    const baseStyle = {
      width: { xs: "50px", sm: "80px", md: "120px", lg: "160px" },
      height: { xs: "50px", sm: "80px", md: "120px", lg: "160px" },
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor:
        // disabled ? "not-allowed" :
        "pointer",
      transition: "all 0.3s ease",
      clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
      fontSize: { xs: "1rem", sm: "1.2rem", md: "1.5rem", lg: "1.8rem" },
      fontWeight: "bold",
      fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
      position: "relative",
      "&:hover": {
        transform:
          //  disabled ? "none" :
          "scale(1.1)",
        zIndex: 1,
      },
    };

    switch (owner) {
      case "green":
        return {
          ...baseStyle,
          backgroundColor: "#22C55E",
          color: "white",
          boxShadow: "0 4px 8px rgba(34, 197, 94, 0.3)",
        };
      case "purple":
        return {
          ...baseStyle,
          backgroundColor: "#A855F7",
          color: "white",
          boxShadow: "0 4px 8px rgba(168, 85, 247, 0.3)",
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: "white",
          color: "#374151",
          border: "2px solid #E5E7EB",
          "&:hover": {
            ...baseStyle["&:hover"],
            backgroundColor: "#F3F4F6",
            borderColor: "#9CA3AF",
          },
        };
    }
  };

  return (
    <Box sx={getCellStyle()} onClick={onClick}>
      {letter}
    </Box>
  );
};

export default HexCell;
