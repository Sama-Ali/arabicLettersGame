import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  useMediaQuery,
  useTheme,
  Stack,
  CircularProgress,
} from "@mui/material";
import GameBoard from "./GameBoard";
import SidePanel from "./SidePanel";
import QuestionModal from "./QuestionModal";
import Header from "./Header";
import supabase from "../supabas-client.ts";
import { v4 as uuidv4 } from "uuid";

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

const Game = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  // Generate random letters for new games
  const generateRandomLetters = () => {
    const arabicLetters = [
      "ض",
      "ر",
      "أ",
      "غ",
      "ج",
      "ه",
      "ل",
      "ت",
      "د",
      "م",
      "ح",
      "ص",
      "ث",
      "ب",
      "ش",
      "ظ",
      "ك",
      "ف",
      "ذ",
      "ق",
      "ز",
      "ي",
      "ط",
      "خ",
      "ع",
      "س",
      "ن",
      "و",
    ];
    const shuffled = [...arabicLetters].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 25);
  };

  // Sound hook
  const { soundEnabled, setSoundEnabled, playCountdownBeep } = useTimerSound();

  // Game state
  const [board, setBoard] = useState([]);
  const [currentTeam, setCurrentTeam] = useState("green");
  const [greenScore, setGreenScore] = useState(0);
  const [purpleScore, setPurpleScore] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState();
  const [currentAnswer, setCurrentAnswer] = useState(""); // Answer for controller only
  const [isLoading, setIsLoading] = useState(true);
  const [sharedId, setSharedId] = useState(null);
  const [roomId, setRoomId] = useState(null);

  // Timer state (for controller)
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerStartTime, setTimerStartTime] = useState(null);
  const [lastBeepTime, setLastBeepTime] = useState(0);
  const [timerDuration, setTimerDuration] = useState(15); // Default 15 seconds

  // Question modal states
  const [selectedCell, setSelectedCell] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [isQuestionRevealed, setIsQuestionRevealed] = useState(false);

  // Load game from Supabase on mount and subscribe to realtime updates
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
          // console.log("📡 Received realtime update:", payload);
          const newData = payload.new;
          if (newData) {
            setBoard(newData.boardState || []);
            setCurrentTeam(newData.currentTeam || "green");

            // Update question state
            if (newData.currentQuestion !== undefined) {
              setCurrentQuestion(newData.currentQuestion);
            }
            if (newData.isQuestionRevealed !== undefined) {
              setIsQuestionRevealed(newData.isQuestionRevealed);
            }

            // Update timer state
            if (newData.timerStartTime !== undefined) {
              setTimerStartTime(newData.timerStartTime);
            }
            if (newData.timerDuration !== undefined) {
              setTimerDuration(newData.timerDuration);
            }

            // Update room data if changed
            if (newData.room !== undefined && newData.room !== roomId) {
              setRoomId(newData.room);
              // Load updated room data
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

            if (newData.selectedCellId !== undefined) {
              // Update timer based on selected cell (players see which letter is being questioned)
            }

            // Update scores
            if (newData.boardState) {
              const greenCells = newData.boardState.filter(
                (c) => c.owner === "green"
              ).length;
              const purpleCells = newData.boardState.filter(
                (c) => c.owner === "purple"
              ).length;
              setGreenScore(greenCells);
              setPurpleScore(purpleCells);
            }
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
          // Check if new game is in the same room and not the current game
          const newGame = payload.new;
          if (
            newGame &&
            roomId &&
            newGame.room === roomId &&
            newGame.gameId !== gameId
          ) {
            console.log("🆕 New game created in same room, switching...");
            // Navigate to the new game
            navigate(`/game/${newGame.gameId}`);
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, roomId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save timer duration to database when it changes
  useEffect(() => {
    const saveTimerDuration = async () => {
      if (gameId) {
        await supabase
          .from("games")
          .update({ timerDuration })
          .eq("gameId", gameId);
      }
    };

    saveTimerDuration();
  }, [timerDuration, gameId]);

  // Timer effect - calculates time based on start time from database (for controller)
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
            if (currentTime - lastBeepTime >= 1000) {
              playCountdownBeep(newRemaining);
              setLastBeepTime(currentTime);
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
      setLastBeepTime(0);
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
    lastBeepTime,
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
        window.alert("اللعبة غير موجودة. سيتم نقلك للصفحة الرئيسة.");
        navigate("/");
        return;
      }

      // Load room data
      if (data.room) {
        const { data: roomData, error: roomError } = await supabase
          .from("rooms")
          .select("*")
          .eq("roomId", data.room)
          .single();

        if (roomData && !roomError) {
          setRoomId(data.room);
          setSharedId(roomData.sharedId);
        }
      }

      // Load game state
      setBoard(data.boardState || []);
      setCurrentTeam(data.currentTeam || "green");

      // Load question state
      if (data.currentQuestion !== undefined) {
        setCurrentQuestion(data.currentQuestion);
      }
      if (data.isQuestionRevealed !== undefined) {
        setIsQuestionRevealed(data.isQuestionRevealed);
      }

      // Load timer state
      if (data.timerStartTime !== undefined) {
        setTimerStartTime(data.timerStartTime);
      }
      if (data.timerDuration !== undefined) {
        setTimerDuration(data.timerDuration);
      } else {
        setTimerDuration(15); // Default to 15 seconds
      }

      // Load room data
      if (data.room) {
        const { data: roomData, error: roomError } = await supabase
          .from("rooms")
          .select("*")
          .eq("roomId", data.room)
          .single();

        if (roomData && !roomError) {
          setRoomId(data.room);
          setSharedId(roomData.sharedId);
        }
      }

      // Calculate scores
      if (data.boardState) {
        const greenCells = data.boardState.filter(
          (c) => c.owner === "green"
        ).length;
        const purpleCells = data.boardState.filter(
          (c) => c.owner === "purple"
        ).length;
        setGreenScore(greenCells);
        setPurpleScore(purpleCells);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error loading game:", error);
      window.alert("حدث خطأ في تحميل اللعبة.");
      navigate("/");
    }
  };

  const handleCellClick = async (cellId) => {
    if (disabled) return;

    const cell = board.find((c) => c.id === cellId);
    if (cell) {
      setSelectedCell(cell);
      setShowQuestionModal(true);
      setIsQuestionRevealed(false); // Reset reveal state for new question

      // Fetch a random question from the database based on the selected letter
      try {
        const { data, error } = await supabase
          .from("questions")
          .select("questionText, answer")
          .eq("letter", cell.letter);

        if (error) {
          setCurrentQuestion("حدث خطأ في تحميل السؤال");
          setCurrentAnswer("");
          return;
        }

        if (data && data.length > 0) {
          // Select a random question from the results
          const randomQuestion = data[Math.floor(Math.random() * data.length)];
          setCurrentQuestion(randomQuestion.questionText);
          setCurrentAnswer(randomQuestion.answer); // Set answer for controller

          // Update question in database for players to see (without answer)
          await supabase
            .from("games")
            .update({
              currentQuestion: randomQuestion.questionText,
              isQuestionRevealed: false,
              timerStartTime: null, // Reset timer
              selectedCellId: cellId, // Save which cell was clicked so players can see the letter
              timerDuration: timerDuration, // Sync current timer duration
            })
            .eq("gameId", gameId);
        } else {
          setCurrentQuestion("لا توجد أسئلة متاحة لهذا الحرف");
          setCurrentAnswer("");
        }
      } catch (err) {
        setCurrentQuestion("حدث خطأ في تحميل السؤال");
        setCurrentAnswer("");
      }
    }
  };

  const handleRevealQuestion = async () => {
    // Update local state
    setIsQuestionRevealed(true);

    // Update database so players can see the question and start timer
    if (gameId) {
      await supabase
        .from("games")
        .update({
          isQuestionRevealed: true,
          timerStartTime: new Date().toISOString(), // Save current time
          timerDuration: timerDuration, // Sync current timer duration
        })
        .eq("gameId", gameId);
    }
  };

  const handleCloseModal = async () => {
    // Stop the timer by resetting it in the database
    if (gameId) {
      await supabase
        .from("games")
        .update({
          isQuestionRevealed: false,
          timerStartTime: null, // Stop the timer
          timerDuration: timerDuration, // Keep the timer duration setting
        })
        .eq("gameId", gameId);
    }

    // Reset local state
    setIsQuestionRevealed(false);
    setTimeLeft(timerDuration);
    setShowQuestionModal(false);
    setSelectedCell(null);
  };

  const handleChangeQuestion = async () => {
    if (!selectedCell) return;

    try {
      // Fetch a new random question from the database based on the selected letter
      const { data, error } = await supabase
        .from("questions")
        .select("questionText, answer")
        .eq("letter", selectedCell.letter);

      if (error) {
        setCurrentQuestion("حدث خطأ في تحميل السؤال");
        setCurrentAnswer("");
        return;
      }

      if (data && data.length > 0) {
        // Select a random question from the results
        const randomQuestion = data[Math.floor(Math.random() * data.length)];
        setCurrentQuestion(randomQuestion.questionText);
        setCurrentAnswer(randomQuestion.answer); // Set answer for controller

        // Update question in database for players to see (without answer)
        // Keep question revealed but reset timer
        await supabase
          .from("games")
          .update({
            currentQuestion: randomQuestion.questionText,
            isQuestionRevealed: true, // Keep question revealed
            timerStartTime: new Date().toISOString(), // Reset timer with new start time
            timerDuration: timerDuration, // Sync current timer duration
          })
          .eq("gameId", gameId);
      } else {
        setCurrentQuestion("لا توجد أسئلة متاحة لهذا الحرف");
        setCurrentAnswer("");
      }
    } catch (err) {
      setCurrentQuestion("حدث خطأ في تحميل السؤال");
      setCurrentAnswer("");
    }
  };

  const handleQuestionAnswer = async (colorChoice, cellId) => {
    if (disabled) return;

    // Update the cell with the chosen color
    const updatedBoard = board.map((cell) =>
      cell.id === cellId ? { ...cell, owner: colorChoice } : cell
    );

    setBoard(updatedBoard);

    // Update scores based on color change
    const greenCells = updatedBoard.filter((c) => c.owner === "green").length;
    const purpleCells = updatedBoard.filter((c) => c.owner === "purple").length;
    setGreenScore(greenCells);
    setPurpleScore(purpleCells);

    // Save updated boardState to Supabase (cell's owner and currentTeam)
    if (gameId) {
      const { error } = await supabase
        .from("games")
        .update({
          boardState: updatedBoard,
          currentTeam: currentTeam === "green" ? "purple" : "green",
          timerDuration: timerDuration, // Sync current timer duration
        })
        .eq("gameId", gameId);

      if (error) {
        console.error("❌ Error updating board state:", error);
      }
    }

    // Switch teams
    setCurrentTeam((prev) => (prev === "green" ? "purple" : "green"));

    // Reset modal state
    setSelectedCell(null);
    setShowQuestionModal(false);

    // Disable interaction briefly
    setDisabled(true);
    setTimeout(() => setDisabled(false), 1000);
  };

  const handlePlayAgain = async () => {
    try {
      // Generate new game in the same room
      const newGameId = uuidv4();
      const randomLetters = generateRandomLetters();
      const initialBoard = randomLetters.map((letter, index) => ({
        id: index,
        letter,
        owner: "none",
      }));

      const newGame = {
        gameId: newGameId,
        room: roomId, // Same room
        currentTeam: "green",
        boardState: initialBoard,
        timerDuration: timerDuration, // Keep the same timer duration
      };

      const { error } = await supabase.from("games").insert([newGame]);

      if (error) {
        console.error("Error creating new game:", error);
        window.alert("حدث خطأ في إنشاء لعبة جديدة.");
        return;
      }

      // Navigate to the new game in the same room (both controller and players)
      navigate(`/game/${newGameId}`);
    } catch (error) {
      console.error("Error:", error);
      window.alert("حدث خطأ. حاول مرة أخرى.");
    }
  };

  const handleGoHome = async () => {
    try {
      // Delete all games in the current room first
      if (roomId) {
        await supabase.from("games").delete().eq("room", roomId);
        console.log("🗑️ Deleted all games in room");
      }

      // Delete the room
      if (roomId) {
        await supabase.from("rooms").delete().eq("roomId", roomId);
        console.log("🏠 Deleted room");
      }

      // Navigate back to entry modal
      navigate("/");
    } catch (error) {
      console.error("Error deleting room:", error);
      // Still navigate home even if deletion fails
      navigate("/");
    }
  };

  const containerStyle = {
    minHeight: "100vh",
    backgroundColor: "#F8FAFC",
    direction: "rtl",
  };

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
        <CircularProgress size={60} sx={{ color: "#22C55E" }} />
      </Box>
    );
  }

  return (
    <>
      <Box sx={containerStyle}>
        <Container maxWidth="xl">
          {/* Header */}
          <Header showSubtitle={true} />

          {/* Game Layout */}
          {isMobile ? (
            <Stack spacing={2} sx={{ width: "100%" }}>
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <GameBoard
                  board={board}
                  onCellClick={handleCellClick}
                  currentTeam={currentTeam}
                  disabled={disabled}
                />
              </Box>
              <Box sx={{ width: "100%", padding: "0 10px" }}>
                <SidePanel
                  greenScore={greenScore}
                  purpleScore={purpleScore}
                  currentTeam={currentTeam}
                  currentQuestion={currentQuestion}
                  // onAnswer={handleAnswer}
                  disabled={disabled}
                  onPlayAgain={handlePlayAgain}
                  onGoHome={handleGoHome}
                  sharedId={sharedId}
                  isQuestionRevealed={isQuestionRevealed}
                  timeLeft={timeLeft}
                  soundEnabled={soundEnabled}
                  setSoundEnabled={setSoundEnabled}
                  timerDuration={timerDuration}
                  setTimerDuration={setTimerDuration}
                />
              </Box>
            </Stack>
          ) : (
            <Box sx={{ display: "flex", width: "100%", height: "80vh" }}>
              {/* Game Board - 80% width */}
              <Box sx={{ width: "78%", height: "100%" }}>
                <GameBoard
                  board={board}
                  onCellClick={handleCellClick}
                  currentTeam={currentTeam}
                  disabled={disabled}
                />
              </Box>

              {/* Side Panel - 20% width */}
              <Box sx={{ width: "22%", height: "100%", paddingRight: "20px" }}>
                <SidePanel
                  greenScore={greenScore}
                  purpleScore={purpleScore}
                  currentTeam={currentTeam}
                  currentQuestion={currentQuestion}
                  // onAnswer={handleAnswer}
                  disabled={disabled}
                  onPlayAgain={handlePlayAgain}
                  onGoHome={handleGoHome}
                  sharedId={sharedId}
                  isQuestionRevealed={isQuestionRevealed}
                  timeLeft={timeLeft}
                  soundEnabled={soundEnabled}
                  setSoundEnabled={setSoundEnabled}
                  timerDuration={timerDuration}
                  setTimerDuration={setTimerDuration}
                />
              </Box>
            </Box>
          )}

          {/* Question Modal */}
          <QuestionModal
            open={showQuestionModal}
            selectedCell={selectedCell}
            question={currentQuestion}
            answer={currentAnswer}
            onClose={handleCloseModal}
            onAnswer={handleQuestionAnswer}
            isQuestionRevealed={isQuestionRevealed}
            onRevealQuestion={handleRevealQuestion}
            onChangeQuestion={handleChangeQuestion}
          />
        </Container>
      </Box>
    </>
  );
};

export default Game;
