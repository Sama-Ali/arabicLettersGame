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
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

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
}) => {
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

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
          borderRadius: "16px",
          padding: "20px",
        },
      }}
    >
      <DialogTitle sx={{ textAlign: "center", padding: "20px 0" }}>
        <Typography
          component="div"
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "#1E293B",
            fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
            marginBottom: 1,
          }}
        >
          الحرف المختار: {selectedCell.letter}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ textAlign: "center", padding: "20px 0" }}>
        <Paper
          sx={{
            padding: "30px",
            backgroundColor: "#F8FAFC",
            borderRadius: "12px",
            marginBottom: "30px",
            position: "relative",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#374151",
              marginBottom: "20px",
              fontWeight: "bold",
              fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
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
              <VisibilityOff sx={{ fontSize: "40px", color: "#9CA3AF" }} />

              <Button
                variant="h5"
                startIcon={<Visibility />}
                onClick={onRevealQuestion}
                sx={{
                  backgroundColor: "#1E293B",
                  color: "white",
                  padding: "12px 20px",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  borderRadius: "8px",
                  textTransform: "none",
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
                variant="h5"
                sx={{
                  color: "#1E293B",
                  lineHeight: 1.6,
                  fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
                  marginBottom: "20px",
                }}
              >
                {question}
              </Typography>

              {/* Change Question Button */}
              {onChangeQuestion && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: "20px",
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={onChangeQuestion}
                    sx={{
                      borderColor: "#1E293B",
                      color: "#1E293B",
                      padding: "8px 16px",
                      fontSize: "0.9rem",
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
                    padding: "15px",
                    backgroundColor: "#EEF2FF",
                    borderRadius: "8px",
                    border: "2px solid #1E293B",
                    marginTop: "20px",
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#1E293B",
                      fontWeight: "bold",
                      marginBottom: "12px",
                      fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
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
                          padding: "10px 20px",
                          fontSize: "1rem",
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
                      variant="h6"
                      sx={{
                        color: "#1E293B",
                        fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
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

        <Box sx={{ textAlign: "center", marginBottom: "20px" }}>
          <Typography
            variant="h6"
            sx={{
              color: "#374151",
              marginBottom: "15px",
              fontWeight: "bold",
              fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
            }}
          >
            :اختر لون الخلية
          </Typography>
          <Stack spacing={2} direction="row" justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={() => handleAnswer("green")}
              sx={{
                backgroundColor: "#22C55E",
                color: "white",
                padding: "15px 30px",
                fontSize: "1.2rem",
                fontWeight: "bold",
                borderRadius: "12px",
                textTransform: "none",
                minWidth: "130px",
                "&:hover": {
                  backgroundColor: "#16A34A",
                },
              }}
            >
              أخضر
            </Button>

            <Button
              variant="contained"
              size="large"
              onClick={() => handleAnswer("purple")}
              sx={{
                backgroundColor: "#A855F7",
                color: "white",
                padding: "15px 30px",
                fontSize: "1.2rem",
                fontWeight: "bold",
                borderRadius: "12px",
                textTransform: "none",
                minWidth: "130px",
                "&:hover": {
                  backgroundColor: "#9333EA",
                },
              }}
            >
              بنفسجي
            </Button>

            <Button
              variant="contained"
              size="large"
              onClick={() => handleAnswer("none")}
              sx={{
                backgroundColor: "#FFFFFF",
                color: "#374151",
                padding: "15px 30px",
                fontSize: "1.2rem",
                fontWeight: "bold",
                borderRadius: "12px",
                textTransform: "none",
                minWidth: "130px",
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
      <DialogActions sx={{ justifyContent: "center", padding: "20px 0" }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            borderColor: "#D1D5DB",
            color: "#6B7280",
            padding: "10px 24px",
            fontSize: "1rem",
            fontWeight: "bold",
            borderRadius: "8px",
            textTransform: "none",
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
