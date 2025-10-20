import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  useMediaQuery,
  useTheme,
  Stack,
  Card,
  CardContent,
  Divider,
  CircularProgress,
} from "@mui/material";
import { Circle } from "@mui/icons-material";
import GameBoard from "./GameBoard";
import supabase from "../supabas-client.ts";

const PlayerView = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  // State
  const [board, setBoard] = useState([]);
  const [currentTeam, setCurrentTeam] = useState("green");
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isQuestionRevealed, setIsQuestionRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds timer
  const [timerStartTime, setTimerStartTime] = useState(null); // the time that the timer started

  // Load game from Supabase and subscribe to realtime updates
  useEffect(() => {
    loadGameFromDatabase();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`game-${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "games",
          filter: `gameId=eq.${gameId}`,
        },
        (payload) => {
          // Player received realtime update
          const newData = payload.new;
          if (newData) {
            setBoard(newData.boardState || []);
            setCurrentTeam(newData.currentTeam || "green");

            // Update question state from controller
            setCurrentQuestion(newData.currentQuestion || "");
            setIsQuestionRevealed(newData.isQuestionRevealed || false);
            setTimerStartTime(newData.timerStartTime || null);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "games",
          filter: `gameId=eq.${gameId}`,
        },
        () => {
          console.log("🗑️ Game deleted, redirecting to home");
          window.alert("انتهت اللعبة. سيتم نقلك للصفحة الرئيسة.");
          navigate("/");
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Timer effect - calculates time based on start time from database
  useEffect(() => {
    let timer;

    if (isQuestionRevealed && currentQuestion && timerStartTime) {
      // Calculate elapsed time and remaining time
      const calculateTimeLeft = () => {
        const startTime = new Date(timerStartTime).getTime();
        const currentTime = new Date().getTime();
        const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
        const remaining = Math.max(0, 60 - elapsedSeconds);
        setTimeLeft(remaining);
        return remaining;
      };

      // Initial calculation
      const remaining = calculateTimeLeft();

      // Only start interval if there's time left
      if (remaining > 0) {
        timer = setInterval(() => {
          const newRemaining = calculateTimeLeft();
          if (newRemaining <= 0) {
            clearInterval(timer);
          }
        }, 1000);
      }
    } else {
      // Reset timer when question is hidden
      setTimeLeft(60);
    }

    // Cleanup timer on unmount or when question changes
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isQuestionRevealed, currentQuestion, timerStartTime]);

  const loadGameFromDatabase = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("gameId", gameId)
        .single();

      if (error || !data) {
        console.error("Game not found:", error);
        window.alert("اللعبة غير موجودة. سيتم نقلك للصفحة الرئيسية.");
        navigate("/");
        return;
      }

      // Load game state
      setBoard(data.boardState || []);
      setCurrentTeam(data.currentTeam || "green");

      // Load question state from controller
      setCurrentQuestion(data.currentQuestion || "");
      setIsQuestionRevealed(data.isQuestionRevealed || false);
      setTimerStartTime(data.timerStartTime || null);

      setIsLoading(false);
    } catch (error) {
      console.error("Error loading game:", error);
      window.alert("حدث خطأ في تحميل اللعبة.");
      navigate("/");
    }
  };

  const containerStyle = {
    minHeight: "100vh",
    backgroundColor: "#F8FAFC",
    padding: { xs: "5px", sm: "10px", md: "15px", lg: "20px" },
    direction: "rtl",
  };

  const headerStyle = {
    textAlign: "center",
    marginBottom: { xs: "20px", sm: "25px", md: "30px" },
    padding: { xs: "15px", sm: "18px", md: "20px" },
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  };

  const panelStyle = {
    padding: "20px",
    backgroundColor: "#F8FAFC",
    borderRadius: "16px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    height: "fit-content",
    minHeight: "300px",
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

  // Show loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F8FAFC",
        }}
      >
        <CircularProgress size={60} sx={{ color: "#A855F7" }} />
      </Box>
    );
  }

  return (
    <Box sx={containerStyle}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={headerStyle}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              color: "#1E293B",
              marginBottom: 2,
              fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
            }}
          >
            لعبة الحروف العربية
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#6B7280",
              fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
            }}
          >
            شاشة اللاعب
          </Typography>
        </Box>

        {/* Game Layout */}
        {isMobile ? (
          <Stack spacing={2} sx={{ width: "100%" }}>
            <Box
              sx={{ width: "100%", display: "flex", justifyContent: "center" }}
            >
              <GameBoard
                board={board}
                onCellClick={() => {}} // No click handler for player view
                currentTeam={currentTeam}
                disabled={true} // Always disabled
              />
            </Box>
            <Box sx={{ width: "100%", padding: "0 10px" }}>
              {/* Player Side Panel - No Room Code */}
              <Box sx={panelStyle}>
                <Typography
                  variant="h5"
                  sx={{
                    textAlign: "center",
                    marginBottom: "16px",
                  }}
                  gutterBottom
                >
                  الفرق
                </Typography>

                <Divider sx={{ marginTop: "30px", marginBottom: "10px" }} />

                {/* Current Turn Indicator */}
                <Box sx={{ textAlign: "center", marginBottom: "10px" }}>
                  <Typography
                    variant="body1"
                    sx={{ color: "#6B7280", marginBottom: 1 }}
                  >
                    دور
                  </Typography>
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
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
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
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Circle sx={{ color: "#A855F7", fontSize: "20px" }} />
                          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                            الفريق البنفسجي
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Stack>

                {/* Timer Section - Mobile */}
                {isQuestionRevealed && currentQuestion && (
                  <>
                    <Divider sx={{ marginY: "20px" }} />
                    <Box sx={{ textAlign: "center", marginY: "20px" }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#6B7280",
                          marginBottom: "12px",
                          fontWeight: "500",
                        }}
                      >
                        الوقت المتبقي
                      </Typography>
                      <Box
                        sx={{
                          backgroundColor:
                            timeLeft <= 10 ? "#FEE2E2" : "#EEF2FF",
                          color: timeLeft <= 10 ? "#DC2626" : "#1E293B",
                          padding: "20px",
                          borderRadius: "16px",
                          fontWeight: "bold",
                          fontSize: "3rem",
                          textAlign: "center",
                          border: `3px solid ${
                            timeLeft <= 10 ? "#DC2626" : "#1E293B"
                          }`,
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        {timeLeft}
                        <Typography
                          component="span"
                          sx={{
                            fontSize: "1.5rem",
                            marginLeft: "8px",
                          }}
                        >
                          ثانية
                        </Typography>
                      </Box>
                    </Box>
                  </>
                )}

                {/* Question Section - Mobile */}
                <Divider sx={{ marginY: "20px" }} />
                <Box sx={{ marginTop: "20px" }}>
                  <Typography
                    variant="h6"
                    sx={{
                      textAlign: "center",
                      fontWeight: "bold",
                      marginBottom: "16px",
                    }}
                  >
                    السؤال الحالي
                  </Typography>
                  <Box
                    sx={{
                      padding: "16px",
                      backgroundColor: "#F3F4F6",
                      borderRadius: "8px",
                      minHeight: "80px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {currentQuestion && isQuestionRevealed ? (
                      <Typography
                        variant="body1"
                        sx={{
                          textAlign: "center",
                          fontSize: "1.1rem",
                          color: "#1F2937",
                        }}
                      >
                        {currentQuestion}
                      </Typography>
                    ) : currentQuestion && !isQuestionRevealed ? (
                      <Typography
                        variant="body2"
                        sx={{
                          textAlign: "center",
                          color: "#9CA3AF",
                          fontStyle: "italic",
                        }}
                      >
                        السؤال مخفي...
                      </Typography>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{
                          textAlign: "center",
                          color: "#9CA3AF",
                          fontStyle: "italic",
                        }}
                      >
                        لا يوجد سؤال حالياً
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Stack>
        ) : (
          <Box sx={{ display: "flex", width: "100%", height: "80vh" }}>
            {/* Game Board - 80% width */}
            <Box sx={{ width: "78%", height: "100%" }}>
              <GameBoard
                board={board}
                onCellClick={() => {}} // No click handler
                currentTeam={currentTeam}
                disabled={true} // Always disabled
              />
            </Box>

            {/* Side Panel - 20% width - No Room Code */}
            <Box sx={{ width: "22%", height: "100%", paddingRight: "20px" }}>
              <Box sx={panelStyle}>
                <Typography
                  variant="h5"
                  sx={{
                    textAlign: "center",
                    marginBottom: "16px",
                  }}
                  gutterBottom
                >
                  الفرق
                </Typography>

                <Divider sx={{ marginTop: "30px", marginBottom: "10px" }} />

                {/* Current Turn Indicator */}
                <Box sx={{ textAlign: "center", marginBottom: "10px" }}>
                  <Typography
                    variant="body1"
                    sx={{ color: "#6B7280", marginBottom: 1 }}
                  >
                    دور
                  </Typography>
                </Box>

                <Stack spacing={2}>
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
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
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
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Circle sx={{ color: "#A855F7", fontSize: "20px" }} />
                          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                            الفريق البنفسجي
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Stack>

                {/* Timer Section - Desktop */}
                {isQuestionRevealed && currentQuestion && (
                  <>
                    <Divider sx={{ marginY: "20px" }} />
                    <Box sx={{ textAlign: "center", marginY: "20px" }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#6B7280",
                          marginBottom: "12px",
                          fontWeight: "500",
                        }}
                      >
                        الوقت المتبقي
                      </Typography>
                      <Box
                        sx={{
                          backgroundColor:
                            timeLeft <= 10 ? "#FEE2E2" : "#EEF2FF",
                          color: timeLeft <= 10 ? "#DC2626" : "#1E293B",
                          padding: "20px",
                          borderRadius: "16px",
                          fontWeight: "bold",
                          fontSize: "3rem",
                          textAlign: "center",
                          border: `3px solid ${
                            timeLeft <= 10 ? "#DC2626" : "#1E293B"
                          }`,
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        {timeLeft}
                        <Typography
                          component="span"
                          sx={{
                            fontSize: "1.5rem",
                            marginLeft: "8px",
                          }}
                        >
                          ثانية
                        </Typography>
                      </Box>
                    </Box>
                  </>
                )}

                {/* Question Section - Desktop */}
                <Divider sx={{ marginY: "20px" }} />
                <Box sx={{ marginTop: "20px" }}>
                  <Typography
                    variant="h6"
                    sx={{
                      textAlign: "center",
                      fontWeight: "bold",
                      marginBottom: "16px",
                    }}
                  >
                    السؤال الحالي
                  </Typography>
                  <Box
                    sx={{
                      padding: "16px",
                      backgroundColor: "#F3F4F6",
                      borderRadius: "8px",
                      minHeight: "80px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {currentQuestion && isQuestionRevealed ? (
                      <Typography
                        variant="body1"
                        sx={{
                          textAlign: "center",
                          fontSize: "1.1rem",
                          color: "#1F2937",
                        }}
                      >
                        {currentQuestion}
                      </Typography>
                    ) : currentQuestion && !isQuestionRevealed ? (
                      <Typography
                        variant="body2"
                        sx={{
                          textAlign: "center",
                          color: "#9CA3AF",
                          fontStyle: "italic",
                        }}
                      >
                        السؤال مخفي...
                      </Typography>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{
                          textAlign: "center",
                          color: "#9CA3AF",
                          fontStyle: "italic",
                        }}
                      >
                        لا يوجد سؤال حالياً
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default PlayerView;
