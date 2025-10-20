import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Divider,
  Stack,
  Button,
} from "@mui/material";
import { Circle, VisibilityOff } from "@mui/icons-material";

const SidePanel = ({
  greenScore,
  purpleScore,
  currentTeam,
  currentQuestion,
  onAnswer,
  disabled,
  onPlayAgain,
  sharedId,
  isQuestionRevealed,
}) => {
  const panelStyle = {
    padding: "20px",
    backgroundColor: "#F8FAFC",
    borderRadius: "16px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    height: "fit-content",
    minHeight: "500px",
  };

  const teamCardStyle = (team, isActive) => ({
    padding: "16px",
    borderRadius: "12px",
    backgroundColor: team === "green" ? "#F0FDF4" : "#FAF5FF",
    border: isActive
      ? `3px solid ${team === "green" ? "#22C55E" : "#A855F7"}`
      : "2px solid #E5E7EB",
    transition: "all 0.3s ease",
    transform: isActive ? "scale(1.02)" : "scale(1)",
  });

  const questionStyle = {
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    marginBottom: "10px",
  };

  const playAgainButtonStyle = {
    backgroundColor: "#1E293B",
    color: "white",
    padding: "12px 32px",
    borderRadius: "8px",
    fontSize: "1.1rem",
    fontWeight: "bold",
    textTransform: "none",
    width: "100%",
  };

  return (
    <Box sx={panelStyle}>
      {/* Scoreboard */}
      <Typography
        variant="h5"
        sx={{
          textAlign: "center",
          marginBottom: "16px",
        }}
        gutterBottom
      >
        التحكم
      </Typography>

      {/* Room Code */}
      {sharedId && (
        <Paper
          sx={{
            padding: "12px 16px",
            backgroundColor: "#EEF2FF",
            borderRadius: "8px",
            marginBottom: "16px",
            textAlign: "center",
            border: "2px solid #1E293B",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "#1E293B",
              fontSize: "0.85rem",
              marginBottom: "4px",
              fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
            }}
          >
            رمز الغرفة
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "#1E293B",
              letterSpacing: "4px",
              fontFamily: "monospace",
            }}
          >
            {sharedId}
          </Typography>
        </Paper>
      )}

      <Divider sx={{ marginTop: "30px", marginBottom: "10px" }} />

      {/* Current Turn Indicator */}
      <Box sx={{ textAlign: "center", marginBottom: "10px" }}>
        <Typography variant="body1" sx={{ color: "#6B7280", marginBottom: 1 }}>
          دور
        </Typography>
        {/* <Chip
          label={currentTeam === "green" ? "الفريق الأخضر" : "الفريق البنفسجي"}
          sx={{
            backgroundColor: currentTeam === "green" ? "#22C55E" : "#A855F7",
            color: "white",
            fontWeight: "bold",
            fontSize: "1.2rem",
          }}
        /> */}
      </Box>

      <Stack spacing={2} sx={{ marginBottom: "40px" }}>
        {/* Green Team */}
        <Card sx={teamCardStyle("green", currentTeam === "green")}>
          <CardContent sx={{ padding: "16px !important" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Circle sx={{ color: "#22C55E", fontSize: "20px" }} />
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  الفريق الأخضر
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Purple Team */}
        <Card sx={teamCardStyle("purple", currentTeam === "purple")}>
          <CardContent sx={{ padding: "16px !important" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Circle sx={{ color: "#A855F7", fontSize: "20px" }} />
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  الفريق البنفسجي
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Stack>

      {/* Question Area */}
      <Paper sx={questionStyle}>
        <Typography
          variant="h5"
          sx={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          السؤال
        </Typography>

        {!isQuestionRevealed ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              marginBottom: "20px",
            }}
          >
            <VisibilityOff sx={{ fontSize: "40px", color: "#9CA3AF" }} />
            {/* <Button
              variant="contained"
              startIcon={<Visibility />}
              onClick={() => setIsQuestionRevealed(true)}
              sx={{
                backgroundColor: "#6366F1",
                color: "white",
                padding: "12px 20px",
                fontSize: "1rem",
                fontWeight: "bold",
                borderRadius: "8px",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#4F46E5",
                },
              }}
            >
              إظهار السؤال
            </Button> */}
          </Box>
        ) : (
          <Typography
            variant="body1"
            sx={{
              textAlign: "center",
              marginBottom: "20px",
              fontSize: "1.5rem",
              lineHeight: 1.6,
              color: "#4B5563",
            }}
          >
            {currentQuestion || "ما هو العدد الأولي الأصغر من 10؟"}
          </Typography>
        )}

        {/* Answer Buttons */}
        {/* <Stack spacing={2}>
          <Button
            variant="contained"
            sx={answerButtonStyle("#22C55E")}
            onClick={() => onAnswer("true")}
            disabled={disabled}
            fullWidth
          >
            صحيح
          </Button>
          <Button
            variant="contained"
            // red color
            sx={answerButtonStyle("#F44336")}
            onClick={() => onAnswer("false")}
            disabled={disabled}
            fullWidth
          >
            خطأ
          </Button>
        </Stack> */}
        {/* play again button */}
        <Button
          variant="contained"
          sx={{ ...playAgainButtonStyle, margin: "10px 0" }}
          onClick={onPlayAgain}
        >
          لعب مرة أخرى
        </Button>
      </Paper>
    </Box>
  );
};

export default SidePanel;
