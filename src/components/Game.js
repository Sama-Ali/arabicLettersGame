import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  useMediaQuery,
  useTheme,
  Stack,
  CircularProgress,
} from "@mui/material";
import GameBoard from "./GameBoard";
import SidePanel from "./SidePanel";
import QuestionModal from "./QuestionModal";
import supabase from "../supabas-client.ts";

const Game = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

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
          console.log("📡 Received realtime update:", payload);
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
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]); // eslint-disable-line react-hooks/exhaustive-deps

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

      // Load game state
      setBoard(data.boardState || []);
      setCurrentTeam(data.currentTeam || "green");
      setSharedId(data.sharedId);

      // Load question state
      if (data.currentQuestion !== undefined) {
        setCurrentQuestion(data.currentQuestion);
      }
      if (data.isQuestionRevealed !== undefined) {
        setIsQuestionRevealed(data.isQuestionRevealed);
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

  // const checkWinCondition = () => {
  //   // Simple win condition: check if any team has 5 consecutive cells in a row
  //   // In a real game, this would check for actual path connections
  //   const greenCells = board.filter((cell) => cell.owner === "green").length;
  //   const purpleCells = board.filter((cell) => cell.owner === "purple").length;

  //   if (greenCells >= 5) {
  //     setWinner("green");
  //     setGameOver(true);
  //   } else if (purpleCells >= 5) {
  //     setWinner("purple");
  //     setGameOver(true);
  //   }
  // };

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
        })
        .eq("gameId", gameId);
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
        })
        .eq("gameId", gameId);

      if (error) {
        console.error("❌ Error updating board state:", error);
      }
    }

    // Check for win condition
    // checkWinCondition();

    // Switch teams
    setCurrentTeam((prev) => (prev === "green" ? "purple" : "green"));

    // Reset modal state
    setSelectedCell(null);
    setShowQuestionModal(false);

    // Disable interaction briefly
    setDisabled(true);
    setTimeout(() => setDisabled(false), 1000);
  };

  // const handleAnswer = (answer) => {
  //   // This function is now handled by handleQuestionAnswer
  //   // Keeping it for backward compatibility with SidePanel
  // };

  const handlePlayAgain = async () => {
    // Delete the current game from database
    if (gameId) {
      await supabase.from("games").delete().eq("gameId", gameId);
    }

    // Navigate back to home
    navigate("/");
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
              كون مسار متصل للفوز!
            </Typography>
          </Box>

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
                  sharedId={sharedId}
                  isQuestionRevealed={isQuestionRevealed}
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
                  sharedId={sharedId}
                  isQuestionRevealed={isQuestionRevealed}
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
            onClose={() => {
              setShowQuestionModal(false);
              setSelectedCell(null);
            }}
            onAnswer={handleQuestionAnswer}
            isQuestionRevealed={isQuestionRevealed}
            onRevealQuestion={handleRevealQuestion}
          />
        </Container>
      </Box>
    </>
  );
};

export default Game;
