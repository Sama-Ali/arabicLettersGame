import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  Box,
  TextField,
  Stack,
} from "@mui/material";
import { Add, Login } from "@mui/icons-material";
import { v4 as uuidv4 } from "uuid";
import supabase from "../supabas-client.ts";

const EntryModal = () => {
  const navigate = useNavigate();
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  // Generate a random 6-digit number
  const generateSharedId = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleCreateNewGame = async () => {
    setIsLoading(true);
    try {
      const randomLetters = generateRandomLetters();
      const initialBoard = randomLetters.map((letter, index) => ({
        id: index,
        letter,
        owner: "none",
      }));

      const gameId = uuidv4();
      const newGame = {
        gameId,
        sharedId: generateSharedId(),
        currentTeam: "green",
        boardState: initialBoard,
      };

      const { error } = await supabase.from("games").insert([newGame]);

      if (error) {
        console.error("Error creating game:", error);
        window.alert("حدث خطأ في إنشاء اللعبة. حاول مرة أخرى.");
        setIsLoading(false);
        return;
      }

      // Navigate to controller view
      navigate(`/game/${gameId}`);
    } catch (error) {
      console.error("Error:", error);
      window.alert("حدث خطأ. حاول مرة أخرى.");
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (roomCode.trim().length !== 6) return;

    setIsLoading(true);
    try {
      // Find game by sharedId
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("sharedId", roomCode.trim())
        .single();

      if (error || !data) {
        window.alert("لم يتم العثور على الغرفة. يرجى التحقق من الرمز.");
        setIsLoading(false);
        return;
      }

      // Navigate to player view
      navigate(`/play/${data.gameId}`);
    } catch (error) {
      console.error("Error:", error);
      window.alert("حدث خطأ. حاول مرة أخرى.");
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={true}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          borderRadius: "16px",
          padding: "30px",
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
          }}
        >
          لعبة الحروف العربية
        </Typography>
        <Typography
          component="div"
          variant="body1"
          sx={{
            color: "#6B7280",
            marginTop: 2,
            fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
          }}
        >
          اختر الطريقة للدخول
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ padding: "20px 0" }}>
        {!showJoinInput ? (
          <Stack spacing={3}>
            {/* Create New Game Button */}
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={handleCreateNewGame}
              disabled={isLoading}
              sx={{
                backgroundColor: "#22C55E",
                color: "white",
                padding: "20px 30px",
                fontSize: "1.3rem",
                fontWeight: "bold",
                borderRadius: "12px",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#16A34A",
                },
                "&:disabled": {
                  backgroundColor: "#D1D5DB",
                },
                fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
              }}
            >
              {isLoading ? "جاري الإنشاء..." : "غرفة جديدة"}
            </Button>

            {/* Join Room Button */}
            <Button
              variant="contained"
              size="large"
              startIcon={<Login />}
              onClick={() => setShowJoinInput(true)}
              sx={{
                backgroundColor: "#A855F7",
                color: "white",
                padding: "20px 30px",
                fontSize: "1.3rem",
                fontWeight: "bold",
                borderRadius: "12px",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#9333EA",
                },
                fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
              }}
            >
              انضم إلى غرفة
            </Button>
          </Stack>
        ) : (
          <Box>
            <Typography
              variant="h6"
              sx={{
                textAlign: "center",
                marginBottom: 3,
                color: "#374151",
                fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
              }}
            >
              أدخل رمز الغرفة
            </Typography>

            <TextField
              fullWidth
              variant="outlined"
              placeholder="123456"
              value={roomCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ""); // Only digits
                if (value.length <= 6) {
                  setRoomCode(value);
                }
              }}
              inputProps={{
                maxLength: 6,
                style: {
                  textAlign: "center",
                  fontSize: "2rem",
                  fontWeight: "bold",
                  letterSpacing: "8px",
                  fontFamily: "monospace",
                },
              }}
              sx={{
                marginBottom: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                },
              }}
            />

            <Stack spacing={2}>
              <Button
                variant="contained"
                size="large"
                onClick={handleJoinRoom}
                disabled={roomCode.length !== 6 || isLoading}
                sx={{
                  backgroundColor: "#1E293B",
                  color: "white",
                  padding: "15px 30px",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  borderRadius: "12px",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#4F46E5",
                  },
                  "&:disabled": {
                    backgroundColor: "#D1D5DB",
                  },
                  fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
                }}
              >
                {isLoading ? "جاري الانضمام..." : "انضم"}
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={() => {
                  setShowJoinInput(false);
                  setRoomCode("");
                }}
                sx={{
                  borderColor: "#D1D5DB",
                  color: "#6B7280",
                  padding: "15px 30px",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  borderRadius: "12px",
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "#9CA3AF",
                    backgroundColor: "#F9FAFB",
                  },
                  fontFamily: '"Cairo", "Noto Sans Arabic", sans-serif',
                }}
              >
                رجوع
              </Button>
            </Stack>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EntryModal;
