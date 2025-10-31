import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Divider,
  Stack,
  Button,
  FormControlLabel,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Tooltip,
} from "@mui/material";
import {
  Circle,
  VolumeUp,
  VolumeOff,
  AccessTime,
  Home,
  Refresh,
} from "@mui/icons-material";

const SidePanel = ({
  greenScore,
  purpleScore,
  currentTeam,
  currentQuestion,
  onAnswer,
  disabled,
  onPlayAgain,
  onGoHome,
  sharedId,
  isQuestionRevealed,
  timeLeft,
  soundEnabled,
  setSoundEnabled,
  timerDuration,
  setTimerDuration,
}) => {
  const [customTime, setCustomTime] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);

  const handlePresetChange = (event, newDuration) => {
    if (newDuration !== null) {
      setTimerDuration(newDuration);
      setIsCustomMode(false);
      setCustomTime("");
    }
  };

  const handleCustomTimeChange = (event) => {
    const value = event.target.value;
    // if (value === "" || (parseInt(value) >= 5 && parseInt(value) <= 300)) {
    setCustomTime(value);
    // }
  };

  const handleCustomTimeApply = () => {
    const timeValue = parseInt(customTime);
    if (timeValue >= 5 && timeValue <= 300) {
      setTimerDuration(timeValue);
      setIsCustomMode(true);
    }
  };

  const presetOptions = [
    { value: 15, label: "15" },
    { value: 30, label: "30" },
    { value: 60, label: "60" },
  ];
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

      <Divider sx={{ marginTop: "16px", marginBottom: "10px" }} />

      {/* Current Turn Indicator */}
      <Box sx={{ textAlign: "center", marginBottom: "10px" }}>
        <Typography variant="body1" sx={{ color: "#6B7280", marginBottom: 1 }}>
          دور
        </Typography>
      </Box>

      <Stack spacing={2} sx={{ marginBottom: "20px" }}>
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

      {/* Timer Settings */}
      <Paper
        sx={{
          ...questionStyle,
          marginBottom: "20px",
          backgroundColor: "#F8FAFC",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            marginBottom: "16px",
          }}
        >
          <AccessTime sx={{ color: "#6B7280" }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "#1E293B",
              fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
            }}
          >
            اختر المدة
          </Typography>
        </Box>

        {/* Preset Timer Options */}
        <Box sx={{ marginBottom: "16px" }}>
          <ToggleButtonGroup
            value={isCustomMode ? "custom" : timerDuration}
            exclusive
            onChange={handlePresetChange}
            aria-label="timer duration"
            sx={{
              display: "flex",
              gap: 0.5,
              "& .MuiToggleButton-root": {
                flex: 1,
                padding: "8px 4px",
                borderRadius: "8px !important",
                border: "1px solid #1E293B",
                textTransform: "none",
                fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
                fontWeight: "bold",
                "&.Mui-selected": {
                  backgroundColor: "#1E293B",
                  color: "white",
                },
              },
            }}
          >
            {presetOptions.map((option) => (
              <ToggleButton key={option.value} value={option.value}>
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* Custom Timer Input */}
        <Box sx={{ marginBottom: "16px" }}>
          <Typography
            variant="body2"
            sx={{
              color: "#6B7280",
              marginBottom: "8px",
              fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
            }}
          >
            أو أدخل وقت مخصص (5-300 ثانية)
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              type="number"
              min={5}
              max={300}
              value={customTime}
              onChange={handleCustomTimeChange}
              placeholder="30"
              size="small"
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
                },
              }}
            />
            <Button
              variant="outlined"
              onClick={handleCustomTimeApply}
              sx={{
                minWidth: "80px",
                textTransform: "none",
                fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
                fontWeight: "bold",
                borderColor:
                  !customTime ||
                  parseInt(customTime) < 5 ||
                  parseInt(customTime) > 300
                    ? "red "
                    : "#22C55E ",
                color:
                  !customTime ||
                  parseInt(customTime) < 5 ||
                  parseInt(customTime) > 300
                    ? "red "
                    : "#22C55E ",
              }}
            >
              تطبيق
            </Button>
          </Box>
        </Box>
        {isQuestionRevealed && currentQuestion && (
          <Box sx={{ textAlign: "center", marginY: "4px" }}>
            {/* Timer Section */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                marginBottom: "10px",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "#6B7280",
                  fontWeight: "500",
                }}
              >
                الوقت المتبقي
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {soundEnabled ? (
                      <VolumeUp sx={{ fontSize: 16, color: "#6B7280" }} />
                    ) : (
                      <VolumeOff sx={{ fontSize: 16, color: "#6B7280" }} />
                    )}
                  </Box>
                }
                sx={{
                  margin: 0,
                  "& .MuiFormControlLabel-label": {
                    fontSize: "0.75rem",
                    color: "#6B7280",
                  },
                }}
              />
            </Box>
            <Box
              sx={{
                backgroundColor:
                  timeLeft <= timerDuration / 3 ? "#FEE2E2" : "#EEF2FF",
                color: timeLeft <= timerDuration / 3 ? "#DC2626" : "#1E293B",
                padding: "20px",
                borderRadius: "16px",
                fontWeight: "bold",
                fontSize: "3rem",
                textAlign: "center",
                border: `3px solid ${
                  timeLeft <= timerDuration / 3 ? "#DC2626" : "#1E293B"
                }`,
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              {timeLeft}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Game Control Buttons */}
      <Stack
        direction="row"
        justifyContent="space-around"
        sx={{ textAlign: "center" }}
      >
        {/* Play Again Button */}
        <Tooltip title="لعبة جديدة">
          <Button
            variant="contained"
            sx={{
              // flex: 1,
              backgroundColor: "#22C55E",
              color: "white",
              padding: "12px 16px",
              fontSize: "0.9rem",
              fontWeight: "bold",
              borderRadius: "8px",
              textTransform: "none",
              fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
              "&:hover": {
                backgroundColor: "#16A34A",
              },
            }}
            onClick={onPlayAgain}
          >
            <Refresh />
          </Button>
        </Tooltip>

        {/* Home Button */}
        <Tooltip title="عودة للصفحة الرئيسة">
          <Button
            variant="outlined"
            sx={{
              // flex: 1,
              borderColor: "#6B7280",
              color: "#6B7280",
              padding: "12px 16px",
              fontSize: "0.9rem",
              fontWeight: "bold",
              borderRadius: "8px",
              textTransform: "none",
              fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',

              "&:hover": {
                borderColor: "#1E293B",
                backgroundColor: "#F9FAFB",
                color: "#1E293B",
              },
            }}
            onClick={onGoHome}
          >
            <Home />
          </Button>
        </Tooltip>
      </Stack>
    </Box>
  );
};

export default SidePanel;
