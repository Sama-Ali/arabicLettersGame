import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
} from "@mui/material";
import { Refresh } from "@mui/icons-material";

const WinnerModal = ({ open, winner, onPlayAgain }) => {
  const getWinnerInfo = () => {
    if (winner === "green") {
      return {
        title: "🎉 الفريق الأخضر فاز!",
        subtitle: "مبروك للفريق الأخضر!",
        color: "#22C55E",
        icon: "🟢",
      };
    } else if (winner === "purple") {
      return {
        title: "🏆 الفريق البنفسجي فاز!",
        subtitle: "مبروك للفريق البنفسجي!",
        color: "#A855F7",
        icon: "🟣",
      };
    }
    return null;
  };

  const winnerInfo = getWinnerInfo();

  if (!winnerInfo) return null;

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          padding: "20px",
        },
      }}
    >
      <DialogTitle sx={{ textAlign: "center", padding: "20px 0" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontSize: "3rem",
              marginBottom: 1,
            }}
          >
            {winnerInfo.icon}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: winnerInfo.color,
              textAlign: "center",
            }}
          >
            {winnerInfo.title}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#6B7280",
              textAlign: "center",
            }}
          >
            {winnerInfo.subtitle}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ textAlign: "center", padding: "20px 0" }}>
        <Paper
          sx={{
            padding: "20px",
            backgroundColor: "#F8FAFC",
            borderRadius: "12px",
            marginBottom: "20px",
          }}
        >
          <Typography
            variant="body1"
            sx={{ color: "#4B5563", lineHeight: 1.6 }}
          >
            لقد نجح الفريق في تكوين مسار متصل عبر اللوحة!
            <br />
            شكراً لكم على اللعب!
          </Typography>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", padding: "20px 0" }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<Refresh />}
          onClick={onPlayAgain}
          sx={{
            backgroundColor: winnerInfo.color,
            color: "white",
            padding: "12px 32px",
            fontSize: "1.1rem",
            fontWeight: "bold",
            borderRadius: "8px",
            textTransform: "none",
            "&:hover": {
              backgroundColor: winnerInfo.color,
              opacity: 0.9,
            },
          }}
        >
          لعب مرة أخرى
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WinnerModal;
