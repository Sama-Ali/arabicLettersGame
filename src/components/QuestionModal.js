import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  Paper,
  Stack,
  Box,
  DialogActions,
  FormControlLabel,
  Switch,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  VolumeUp,
  VolumeOff,
} from "@mui/icons-material";

const QuestionModal = ({
  open,
  selectedCell,
  question,
  answer,
  onClose,
  onAnswer,
  isQuestionRevealed,
  onRevealQuestion,
  onChangeQuestion,
  timeLeft,
  timerDuration,
  soundEnabled,
  setSoundEnabled,
}) => {
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Reset answer reveal state when modal opens/closes or question changes
  useEffect(() => {
    if (!open) {
      setIsAnswerRevealed(false);
    }
  }, [open, question]);

  // Reset answer reveal when question changes
  useEffect(() => {
    setIsAnswerRevealed(false);
  }, [question]);

  if (!selectedCell) return null;

  const handleAnswer = (answer) => {
    onAnswer(answer, selectedCell.id);
    onClose();
  };

  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: "12px", sm: "16px" },
          padding: { xs: "12px", sm: "20px" },
          margin: { xs: "8px", sm: "32px" },
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          padding: { xs: "12px 0", sm: "20px 0" },
        }}
      >
        <Typography
          component="div"
          variant={isMobile ? "h5" : "h4"}
          sx={{
            fontWeight: "bold",
            color: "#1E293B",
            fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
            marginBottom: 1,
            fontSize: { xs: "1.25rem", sm: "2.125rem" },
          }}
        >
          الحرف المختار: {selectedCell.letter}
        </Typography>
      </DialogTitle>

      <DialogContent
        sx={{
          textAlign: "center",
          padding: { xs: "12px 0", sm: "20px 0" },
        }}
      >
        <Paper
          sx={{
            padding: { xs: "16px", sm: "30px" },
            backgroundColor: "#F8FAFC",
            borderRadius: { xs: "8px", sm: "12px" },
            marginBottom: { xs: "16px", sm: "30px" },
            position: "relative",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#374151",
              marginBottom: { xs: "12px", sm: "20px" },
              fontWeight: "bold",
              fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
              fontSize: { xs: "1rem", sm: "1.25rem" },
            }}
          >
            :السؤال
          </Typography>

          {!isQuestionRevealed ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <VisibilityOff
                sx={{
                  fontSize: { xs: "32px", sm: "40px" },
                  color: "#9CA3AF",
                }}
              />

              <Button
                variant="h5"
                startIcon={<Visibility />}
                onClick={onRevealQuestion}
                sx={{
                  backgroundColor: "#1E293B",
                  color: "white",
                  padding: { xs: "10px 16px", sm: "12px 20px" },
                  fontSize: { xs: "0.9rem", sm: "1.1rem" },
                  fontWeight: "bold",
                  borderRadius: "8px",
                  textTransform: "none",
                  marginTop: { xs: "8px", sm: "12px" },
                  "&:hover": {
                    backgroundColor: "#4F46E5",
                  },
                }}
              >
                إظهار السؤال
              </Button>
            </Box>
          ) : (
            <Box>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                sx={{
                  color: "#1E293B",
                  lineHeight: 1.6,
                  fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
                  marginBottom: { xs: "12px", sm: "20px" },
                  fontSize: { xs: "1.1rem", sm: "1.5rem" },
                  padding: { xs: "0 8px", sm: "0" },
                }}
              >
                {question}
              </Typography>

              {/* Timer Display */}
              {timeLeft !== undefined && timerDuration !== undefined && (
                <Box
                  sx={{
                    textAlign: "center",
                    marginBottom: { xs: "12px", sm: "20px" },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: { xs: 0.5, sm: 1 },
                      marginBottom: { xs: "8px", sm: "10px" },
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#6B7280",
                        fontWeight: "500",
                        fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      }}
                    >
                      الوقت المتبقي
                    </Typography>
                    {soundEnabled !== undefined && setSoundEnabled && (
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
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            {soundEnabled ? (
                              <VolumeUp
                                sx={{ fontSize: 16, color: "#6B7280" }}
                              />
                            ) : (
                              <VolumeOff
                                sx={{ fontSize: 16, color: "#6B7280" }}
                              />
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
                    )}
                  </Box>
                  <Box
                    sx={{
                      backgroundColor:
                        timeLeft <= timerDuration / 3 ? "#FEE2E2" : "#EEF2FF",
                      color:
                        timeLeft <= timerDuration / 3 ? "#DC2626" : "#1E293B",
                      padding: { xs: "16px", sm: "20px" },
                      borderRadius: { xs: "12px", sm: "16px" },
                      fontWeight: "bold",
                      fontSize: { xs: "2rem", sm: "3rem" },
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

              {/* Change Question Button */}
              {onChangeQuestion && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: { xs: "12px", sm: "20px" },
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={onChangeQuestion}
                    sx={{
                      borderColor: "#1E293B",
                      color: "#1E293B",
                      padding: { xs: "6px 12px", sm: "8px 16px" },
                      fontSize: { xs: "0.8rem", sm: "0.9rem" },
                      fontWeight: "bold",
                      borderRadius: "8px",
                      textTransform: "none",
                      fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
                      "&:hover": {
                        borderColor: "#4F46E5",
                        color: "#4F46E5",
                      },
                    }}
                  >
                    تغيير السؤال
                  </Button>
                </Box>
              )}

              {/* Answer Section - Only for Controller */}
              {answer && (
                <Paper
                  elevation={2}
                  sx={{
                    padding: { xs: "12px", sm: "15px" },
                    backgroundColor: "#EEF2FF",
                    borderRadius: { xs: "6px", sm: "8px" },
                    border: "2px solid #1E293B",
                    marginTop: { xs: "12px", sm: "20px" },
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#1E293B",
                      fontWeight: "bold",
                      marginBottom: { xs: "8px", sm: "12px" },
                      fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    }}
                  >
                    :الإجابة
                  </Typography>

                  {!isAnswerRevealed ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Button
                        variant="contained"
                        startIcon={<Visibility />}
                        onClick={() => setIsAnswerRevealed(true)}
                        sx={{
                          backgroundColor: "#1E293B",
                          color: "white",
                          padding: { xs: "8px 16px", sm: "10px 20px" },
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                          fontWeight: "bold",
                          borderRadius: "8px",
                          textTransform: "none",
                          "&:hover": {
                            backgroundColor: "#4F46E5",
                          },
                        }}
                      >
                        إظهار الإجابة
                      </Button>
                    </Box>
                  ) : (
                    <Typography
                      variant={isMobile ? "body1" : "h6"}
                      sx={{
                        color: "#1E293B",
                        fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
                        fontSize: { xs: "1rem", sm: "1.25rem" },
                      }}
                    >
                      {answer}
                    </Typography>
                  )}
                </Paper>
              )}
            </Box>
          )}
        </Paper>

        <Box
          sx={{
            textAlign: "center",
            marginBottom: { xs: "12px", sm: "20px" },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#374151",
              marginBottom: { xs: "10px", sm: "15px" },
              fontWeight: "bold",
              fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
              fontSize: { xs: "1rem", sm: "1.25rem" },
            }}
          >
            :اختر لون الخلية
          </Typography>
          <Stack
            spacing={{ xs: 1.5, sm: 2 }}
            direction={{ xs: "column", sm: "row" }}
            justifyContent="center"
            sx={{ width: "100%" }}
          >
            <Button
              variant="contained"
              size={isMobile ? "medium" : "large"}
              onClick={() => handleAnswer("green")}
              sx={{
                backgroundColor: "#22C55E",
                color: "white",
                padding: { xs: "12px 20px", sm: "15px 30px" },
                fontSize: { xs: "1rem", sm: "1.2rem" },
                fontWeight: "bold",
                borderRadius: { xs: "8px", sm: "12px" },
                textTransform: "none",
                minWidth: { xs: "100%", sm: "130px" },
                "&:hover": {
                  backgroundColor: "#16A34A",
                },
              }}
            >
              أخضر
            </Button>

            <Button
              variant="contained"
              size={isMobile ? "medium" : "large"}
              onClick={() => handleAnswer("purple")}
              sx={{
                backgroundColor: "#A855F7",
                color: "white",
                padding: { xs: "12px 20px", sm: "15px 30px" },
                fontSize: { xs: "1rem", sm: "1.2rem" },
                fontWeight: "bold",
                borderRadius: { xs: "8px", sm: "12px" },
                textTransform: "none",
                minWidth: { xs: "100%", sm: "130px" },
                "&:hover": {
                  backgroundColor: "#9333EA",
                },
              }}
            >
              بنفسجي
            </Button>

            <Button
              variant="contained"
              size={isMobile ? "medium" : "large"}
              onClick={() => handleAnswer("none")}
              sx={{
                backgroundColor: "#FFFFFF",
                color: "#374151",
                padding: { xs: "12px 20px", sm: "15px 30px" },
                fontSize: { xs: "1rem", sm: "1.2rem" },
                fontWeight: "bold",
                borderRadius: { xs: "8px", sm: "12px" },
                textTransform: "none",
                minWidth: { xs: "100%", sm: "130px" },
                border: "2px solid #E5E7EB",
                "&:hover": {
                  backgroundColor: "#F3F4F6",
                },
              }}
            >
              أبيض
            </Button>
          </Stack>
        </Box>
      </DialogContent>

      {/* cancel button */}
      <DialogActions
        sx={{
          justifyContent: "center",
          padding: { xs: "12px 0", sm: "20px 0" },
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            borderColor: "#D1D5DB",
            color: "#6B7280",
            padding: { xs: "8px 20px", sm: "10px 24px" },
            fontSize: { xs: "0.875rem", sm: "1rem" },
            fontWeight: "bold",
            borderRadius: "8px",
            textTransform: "none",
            width: { xs: "100%", sm: "auto" },
            "&:hover": {
              borderColor: "#9CA3AF",
              backgroundColor: "#F9FAFB",
            },
          }}
        >
          إلغاء
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuestionModal;
