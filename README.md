# 🎮 Arabic Letters Game

An interactive educational game based on Arabic letters, where two teams (Green and Purple) compete to control a hexagonal board by answering questions.

## ✨ Features

- 🎯 **Interactive Hexagonal Board** - 25 cells with random Arabic letters
- 👥 **Multiplayer Mode** - One controller and multiple players
- ⚡ **Real-time Updates** - Using Supabase Realtime
- 📱 **Responsive Design** - Works on all devices
- 🎨 **Beautiful Arabic Interface** - With Cairo and Noto Sans Arabic fonts
- 💾 **Large Question Database** - 840 questions across 28 letters
- 🔐 **Room System** - 6-digit sharing code
- ⏱️ **60-Second Timer** - Persistent countdown that syncs across all players

### Installation

**Clone the project**

## 🎮 How to Play

### For Controller:

1. **Create a new room**

   - Click "New Room" (غرفة جديدة)
   - You'll get a 6-digit room code

2. **Share the code**

   - Share the room code with players

3. **Start playing**
   - Select a cell on the board
   - A hidden question will appear with its answer (only you see the answer)
   - Click "Show Question" (إظهار السؤال) to reveal it to everyone
   - 60-second timer starts automatically
   - Choose the cell color (Green, Purple, or White)

### For Players:

1. **Join a room**

   - Click "Join Room" (انضم إلى غرفة)
   - Enter the 6-digit room code

2. **Watch and participate**
   - Watch the board and gameplay in real-time
   - See the 60-second countdown timer
   - Read the question when the controller reveals it
   - Help your team answer!

## 🏗️ Technical Architecture

### Technologies Used

- **React** - UI library
- **Material-UI (MUI)** - Component library
- **Supabase** - Database and real-time updates
- **React Router** - Navigation
- **UUID** - Unique identifier generation

### Project Structure

```
src/
├── components/
│   ├── Game.js              # Main controller screen
│   ├── PlayerView.js        # Players screen
│   ├── EntryModal.js        # Entry screen
│   ├── GameBoard.js         # Game board
│   ├── HexCell.js           # Hexagonal cell
│   ├── QuestionModal.js     # Question modal
│   └── SidePanel.js         # Side panel
├── supabas-client.ts        # Supabase setup
├── App.js                   # Main component
└── index.js                 # Entry point
```

## 📊 Database Schema

### `games` Table

| Column             | Type      | Description                 |
| ------------------ | --------- | --------------------------- |
| gameId             | UUID      | Unique game identifier      |
| sharedId           | TEXT      | Sharing code (6 digits)     |
| currentTeam        | TEXT      | Current team (green/purple) |
| boardState         | JSONB     | Board state                 |
| currentQuestion    | TEXT      | Current question            |
| isQuestionRevealed | BOOLEAN   | Is question revealed?       |
| timerStartTime     | TIMESTAMP | When the 60s timer started  |
| created_at         | TIMESTAMP | Game creation time          |

### `questions` Table

| Column       | Type   | Description   |
| ------------ | ------ | ------------- |
| id           | SERIAL | Identifier    |
| letter       | TEXT   | Arabic letter |
| questionText | TEXT   | Question text |
| answer       | TEXT   | Answer        |

## 🎨 Customization

### Change Colors

In component files, you can modify colors:

```javascript
// Green team
primary: {
  main: "#22C55E";
}

// Purple team
secondary: {
  main: "#A855F7";
}

## 🎯 Game Features

### For Controller:

- ✅ View questions with answers
- ✅ Control question reveal timing
- ✅ Choose cell colors
- ✅ See room code
- ✅ Monitor 60-second timer

### For Players:

- 👀 View board in real-time
- 📖 Read questions when revealed
- ⏱️ See synchronized 60-second timer
- 🚫 Cannot see answers
- 🚫 Cannot control the game

## 📝 License

This project is open source and available for personal and educational use.

## 🤝 Contributing

Contributions are welcome! Feel free to open an Issue or Pull Request.

## 📧 Contact

If you have any questions or suggestions, feel free to reach out!

**Email:** samaali2h@gmail.com

---

Made with ❤️ for education and fun
```
