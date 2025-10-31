import React from "react";
import { Box, Paper } from "@mui/material";
import HexCell from "./HexCell";

const GameBoard = ({
  board,
  onCellClick,
  currentTeam,
  disabled,
  selectedCellId,
}) => {
  const boardStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: { xs: "10px", sm: "20px", md: "40px", lg: "60px" },
    backgroundColor: "#1E293B",
    borderRadius: "20px",
    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.3)",
    position: "relative",
    overflow: "hidden",
    width: "100%",
    height: "100%",
    minHeight: { xs: "350px", sm: "450px", md: "600px", lg: "800px" },
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: { xs: "52px", sm: "70px", md: "90px", lg: "120px" },
      background: "linear-gradient(135deg, #22C55E 0%,rgb(44, 177, 93) 100%)",
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      zIndex: 1,
    },
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: { xs: "52px", sm: "70px", md: "90px", lg: "120px" },
      background: "linear-gradient(135deg, #22C55E 0%, rgb(44, 177, 93) 100%)",
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      zIndex: 1,
    },
  };

  // the grid (all cells in all rows)
  const gridStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: {
      xs: "20px 48px 20px 22px", // top right bottom left - slight right shift
      sm: "40px 76px 40px 44px", // Slight right shift
      md: "80px 134px 80px 86px", // Slight right shift
      lg: "120px 204px 120px 120px", // Slight right shift
    },
    zIndex: 10,
    position: "relative",
  };

  const rowStyle = (rowIndex) => ({
    display: "flex",
    justifyContent: "center",
    gap: { xs: "4px", sm: "6px", md: "8px", lg: "10px" }, // Space between cells
    marginBottom: { xs: "-6px", sm: "-10px", md: "-15px", lg: "-25px" }, // Offset every other row for hexagonal effect
    transform:
      rowIndex % 2 === 1
        ? {
            xs: "translateX(25px)",
            sm: "translateX(40px)",
            md: "translateX(60px)",
            lg: "translateX(85px)",
          }
        : "translateX(0px)", // Offset every other row
  });

  // Create proper hexagonal grid with offset rows
  const createHexGrid = () => {
    const rows = [];
    for (let i = 0; i < 5; i++) {
      const rowCells = board.slice(i * 5, (i + 1) * 5);
      rows.push(
        <Box key={i} sx={rowStyle(i)}>
          {rowCells.map((cell, index) => {
            const cellId = i * 5 + index;
            return (
              <HexCell
                key={cellId}
                letter={cell.letter}
                owner={cell.owner}
                onClick={() => onCellClick(cellId)}
                isSelected={selectedCellId === cellId}
                // disabled={disabled || cell.owner !== "none"}
                // disabled={disabled}
              />
            );
          })}
        </Box>
      );
    }
    return rows;
  };

  return (
    <Paper elevation={8} sx={boardStyle}>
      {/* Left Purple Edge */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: { xs: "120px", sm: "150px", md: "180px", lg: "203px" },
          background: "linear-gradient(135deg, #A855F7 0%, #9333EA 100%)",
          clipPath: "polygon(0% 0%, 100% 15%, 100% 85%, 0% 100%)",
          zIndex: 2,
        }}
      />

      {/* Right Purple Edge */}
      <Box
        sx={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: { xs: "120px", sm: "150px", md: "180px", lg: "203px" },
          background: "linear-gradient(135deg, #A855F7 0%, #9333EA 100%)",
          clipPath: "polygon(0% 15%, 100% 0%, 100% 100%, 0% 85%)",
          zIndex: 2,
        }}
      />

      <Box sx={gridStyle}>{createHexGrid()}</Box>
    </Paper>
  );
};

export default GameBoard;
