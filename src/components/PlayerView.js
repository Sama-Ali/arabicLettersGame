import React, { useState, useEffect, useRef } from "react";
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
  Paper,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Circle, VolumeUp, VolumeOff } from "@mui/icons-material";
import GameBoard from "./GameBoard";
import Header from "./Header";
import supabase from "../supabas-client.ts";

// Custom hook for timer sound effects using Web Audio API
const useTimerSound = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [audioContext, setAudioContext] = useState(null);

  // Initialize Web Audio API context
  useEffect(() => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(context);

    return () => {
      if (context) {
        context.close();
      }
    };
  }, []);

  // Function to play a beep sound
  const playBeep = (frequency = 800, duration = 200, type = "sine") => {
    if (!soundEnabled || !audioContext) return;

    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + duration / 1000
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.warn("Error playing sound:", error);
    }
  };

  // Function to play countdown beeps (different tones for urgency in last 5 seconds)
  const playCountdownBeep = (secondsLeft) => {
    if (!soundEnabled || !audioContext) return;

    let frequency = 600; // Default frequency

    if (secondsLeft <= 2) {
      frequency = 1000; // High pitch for urgency (last 2 seconds)
    } else if (secondsLeft <= 4) {
      frequency = 800; // Medium pitch (3-4 seconds)
    } else {
      frequency = 600; // Low pitch (5 seconds)
    }

    playBeep(frequency, 150);
  };

  return {
    soundEnabled,
    setSoundEnabled,
    playBeep,
    playCountdownBeep,
  };
};

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
  const [timeLeft, setTimeLeft] = useState(15); // 60 seconds timer
  const [timerStartTime, setTimerStartTime] = useState(null); // the time that the timer started
  const [selectedCellId, setSelectedCellId] = useState(null); // Track which cell/letter is being questioned
  const [timerDuration, setTimerDuration] = useState(15); // Default 15 seconds
  const [sharedId, setSharedId] = useState(null); // Room shared ID
  const [roomId, setRoomId] = useState(null); // Current room ID
  const lastBeepTime = useRef(0); // Track when we last played a beep sound

  // Sound hook
  const { soundEnabled, setSoundEnabled, playCountdownBeep } = useTimerSound();

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

            // Update timer duration from controller
            if (newData.timerDuration !== undefined) {
              setTimerDuration(newData.timerDuration);
            }

            // Update room data if changed
            if (newData.room !== undefined && newData.room !== roomId) {
              setRoomId(newData.room);
              const loadRoomData = async () => {
                const { data: roomData } = await supabase
                  .from("rooms")
                  .select("*")
                  .eq("roomId", newData.room)
                  .single();
                if (roomData) {
                  setSharedId(roomData.sharedId);
                }
              };
              loadRoomData();
            }

            // Update selected cell ID so players can see which letter is being questioned
            setSelectedCellId(
              newData.selectedCellId !== undefined
                ? newData.selectedCellId
                : null
            );
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "games",
        },
        (payload) => {
          // Check if new game is in the same room
          const newGame = payload.new;
          if (
            newGame &&
            roomId &&
            newGame.room === roomId &&
            newGame.gameId !== gameId
          ) {
            console.log("🆕 New game created in same room, switching...");
            // Navigate to the new game
            navigate(`/play/${newGame.gameId}`);
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
        async () => {
          console.log(
            "🗑️ Current game deleted, looking for another game in room..."
          );
          if (roomId) {
            // Try to find another game in the same room
            const { data: anotherGame } = await supabase
              .from("games")
              .select("*")
              .eq("room", roomId)
              .neq("gameId", gameId)
              .order("created_at", { ascending: false })
              .limit(1)
              .single();

            if (anotherGame) {
              console.log("🔄 Switching to another game in same room");
              navigate(`/play/${anotherGame.gameId}`);
              return;
            }
          }

          // No other game found, go home
          console.log("🏠 No other games in room, redirecting to home");
          window.alert("انتهت اللعبة. سيتم نقلك للصفحة الرئيسة.");
          navigate("/");
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, roomId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Timer effect - calculates time based on start time from database
  useEffect(() => {
    let timer;

    if (isQuestionRevealed && currentQuestion && timerStartTime) {
      // Calculate elapsed time and remaining time
      const calculateTimeLeft = () => {
        const startTime = new Date(timerStartTime).getTime();
        const currentTime = new Date().getTime();
        const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
        const remaining = Math.max(0, timerDuration - elapsedSeconds);
        setTimeLeft(remaining);
        return remaining;
      };

      // Initial calculation
      const remaining = calculateTimeLeft();

      // Only start interval if there's time left
      if (remaining > 0) {
        timer = setInterval(() => {
          const newRemaining = calculateTimeLeft();

          // Play sound every second during last 5 seconds
          if (newRemaining <= 5 && newRemaining > 0) {
            // Play 1 beep per second in the last 5 seconds
            const currentTime = Date.now();
            if (currentTime - lastBeepTime.current >= 1000) {
              playCountdownBeep(newRemaining);
              lastBeepTime.current = currentTime;
            }
          }

          if (newRemaining <= 0) {
            clearInterval(timer);
            // Play final urgent beep when time runs out
            if (soundEnabled) {
              playCountdownBeep(0);
            }
          }
        }, 1000);
      }
    } else {
      // Reset timer when question is hidden
      setTimeLeft(timerDuration);
      lastBeepTime.current = 0;
    }

    // Cleanup timer on unmount or when question changes
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [
    isQuestionRevealed,
    currentQuestion,
    timerStartTime,
    timerDuration,
    soundEnabled,
    playCountdownBeep,
  ]);

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

      // Load timer duration from controller
      if (data.timerDuration !== undefined) {
        setTimerDuration(data.timerDuration);
      } else {
        setTimerDuration(15); // Default to 15 seconds
      }

      // Load room data
      if (data.room) {
        setRoomId(data.room);
        const { data: roomData, error: roomError } = await supabase
          .from("rooms")
          .select("*")
          .eq("roomId", data.room)
          .single();

        if (roomData && !roomError) {
          setSharedId(roomData.sharedId);
        }
      }

      // Load selected cell ID so players can see which letter is being questioned
      setSelectedCellId(
        data.selectedCellId !== undefined ? data.selectedCellId : null
      );

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
    direction: "rtl",
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
        <Header showSubtitle={true} />

        {/* Question Section - Prominent Display */}
        <Box
          sx={{
            marginBottom: { xs: "5px", sm: "8px", md: "10px" },
            padding: { xs: "8px", sm: "10px", md: "12px" },
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            minHeight: "50px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              padding: { xs: "6px", sm: "8px", md: "10px" },
              backgroundColor: "#F3F4F6",
              borderRadius: "10px",
              minHeight: "35px",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {currentQuestion && isQuestionRevealed ? (
              <Typography
                variant="h6"
                sx={{
                  textAlign: "center",
                  fontSize: { xs: "1.4rem", sm: "1.5rem", md: "1.6rem" },
                  color: "#1F2937",
                  fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
                  fontWeight: "700",
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
                  fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
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
                  fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
                }}
              >
                لا يوجد سؤال حالياً
              </Typography>
            )}
          </Box>
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
                selectedCellId={selectedCellId}
              />
            </Box>
            <Box sx={{ width: "100%", padding: "0 10px" }}>
              {/* Player Side Panel */}
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

                {/* Room Code Display */}
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
                        color: "#A855F7",
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
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                          marginBottom: "12px",
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
                              onChange={(e) =>
                                setSoundEnabled(e.target.checked)
                              }
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
                      </Box>
                      <Box
                        sx={{
                          backgroundColor:
                            timeLeft <= timerDuration / 3
                              ? "#FEE2E2"
                              : "#EEF2FF",
                          color:
                            timeLeft <= timerDuration / 3
                              ? "#DC2626"
                              : "#1E293B",
                          padding: "20px",
                          borderRadius: "16px",
                          fontWeight: "bold",
                          fontSize: "3rem",
                          textAlign: "center",
                          border: `3px solid ${
                            timeLeft <= timerDuration / 3
                              ? "#DC2626"
                              : "#1E293B"
                          }`,
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        {timeLeft}
                      </Box>
                    </Box>
                  </>
                )}
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
                selectedCellId={selectedCellId}
              />
            </Box>

            {/* Side Panel - 20% width */}
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

                {/* Room Code Display */}
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
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                          marginBottom: "12px",
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
                              onChange={(e) =>
                                setSoundEnabled(e.target.checked)
                              }
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
                      </Box>
                      <Box
                        sx={{
                          backgroundColor:
                            timeLeft <= timerDuration / 3
                              ? "#FEE2E2"
                              : "#EEF2FF",
                          color:
                            timeLeft <= timerDuration / 3
                              ? "#DC2626"
                              : "#1E293B",
                          padding: "20px",
                          borderRadius: "16px",
                          fontWeight: "bold",
                          fontSize: "3rem",
                          textAlign: "center",
                          border: `3px solid ${
                            timeLeft <= timerDuration / 3
                              ? "#DC2626"
                              : "#1E293B"
                          }`,
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        {timeLeft}
                      </Box>
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default PlayerView;
