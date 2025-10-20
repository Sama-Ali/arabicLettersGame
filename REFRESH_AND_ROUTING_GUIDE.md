# 🎮 Game Refresh & Routing System - Implementation Guide

## ✅ What Has Been Implemented

Your React game now has a **complete URL-based routing system** that uses **Supabase** for persistence and real-time sync. The game state survives page refreshes and syncs automatically between controller and players.

---

## 🏗️ Architecture Overview

### **URL Structure**

- `/` - Entry modal (home page)
- `/game/:gameId` - Controller view (game host)
- `/play/:gameId` - Player view (participants)

### **Key Components**

#### 1. **App.js** (Router Setup)

- Uses `react-router-dom` for URL-based routing
- Defines three main routes: home, controller, and player views
- No longer manages game state - each component manages its own state

#### 2. **EntryModal.js** (Home Page)

- **Create New Game:**

  - Generates a unique `gameId` (UUID)
  - Generates a 6-digit `sharedId` (room code)
  - Creates initial board with 25 random Arabic letters
  - Inserts game into Supabase `games` table
  - Navigates to `/game/:gameId`

- **Join Existing Game:**
  - User enters 6-digit room code
  - Searches Supabase for matching `sharedId`
  - If found, navigates to `/play/:gameId`
  - If not found, shows error alert

#### 3. **Game.js** (Controller View)

- **On Mount:**

  - Reads `gameId` from URL params
  - Fetches game from Supabase using `gameId`
  - If game not found, redirects to home
  - Subscribes to Supabase realtime updates

- **Game Updates:**

  - When controller makes a move, updates `boardState` and `currentTeam` in Supabase
  - Realtime subscription automatically updates all connected clients

- **Refresh Handling:**

  - Game ID is in URL (`/game/:gameId`)
  - On refresh, reads `gameId` from URL
  - Fetches latest state from Supabase
  - Restores board, scores, and current team

- **Play Again:**
  - Deletes game from Supabase
  - Navigates back to home (`/`)

#### 4. **PlayerView.js** (Player View)

- **On Mount:**

  - Reads `gameId` from URL params
  - Fetches game from Supabase
  - Subscribes to realtime updates (UPDATE and DELETE events)

- **Realtime Updates:**

  - When controller makes a move, player's board updates automatically
  - When game is deleted, player is redirected to home

- **Refresh Handling:**
  - Game ID is in URL (`/play/:gameId`)
  - On refresh, fetches latest state from Supabase
  - Board and team indicator update automatically

---

## 🔄 Complete Flow

### **Scenario 1: New Game**

1. User opens app → sees EntryModal at `/`
2. User clicks "New Game"
3. EntryModal creates game in Supabase
4. User is navigated to `/game/:gameId` (controller view)
5. Controller sees board and shares 6-digit room code
6. **If controller refreshes:** URL contains `gameId`, board state restored from Supabase

### **Scenario 2: Join Game**

1. User opens app → sees EntryModal at `/`
2. User clicks "Join Game" and enters room code
3. EntryModal searches Supabase for game with matching `sharedId`
4. User is navigated to `/play/:gameId` (player view)
5. Player sees live board updates as controller makes moves
6. **If player refreshes:** URL contains `gameId`, board state restored from Supabase

### **Scenario 3: Game in Progress - Refresh**

1. **Controller refreshes:**

   - Browser reads URL: `/game/abc-123-def-456`
   - Game.js extracts `gameId` from URL
   - Fetches game from Supabase
   - Restores board state, scores, and current team
   - Reconnects to realtime subscription

2. **Player refreshes:**
   - Browser reads URL: `/play/abc-123-def-456`
   - PlayerView.js extracts `gameId` from URL
   - Fetches game from Supabase
   - Restores board state and current team
   - Reconnects to realtime subscription

---

## 📡 Realtime Subscriptions

### **Game.js (Controller)**

```javascript
supabase
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
      // Updates board state automatically
    }
  )
  .subscribe();
```

### **PlayerView.js (Player)**

```javascript
supabase
  .channel(`game-${gameId}`)
  .on("postgres_changes", {
    event: "UPDATE",
    // ... updates board when controller makes move
  })
  .on("postgres_changes", {
    event: "DELETE",
    // ... redirects to home when game ends
  })
  .subscribe();
```

---

## 🗄️ Supabase Database Schema

### **games** table

```sql
CREATE TABLE games (
  gameId UUID PRIMARY KEY,
  sharedId TEXT UNIQUE NOT NULL,  -- 6-digit room code
  currentTeam TEXT NOT NULL,       -- "green" or "purple"
  boardState JSONB NOT NULL,       -- Array of 25 cells
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **boardState** structure

```json
[
  { "id": 0, "letter": "ض", "owner": "none" },
  { "id": 1, "letter": "ر", "owner": "green" },
  { "id": 2, "letter": "أ", "owner": "purple" }
  // ... 22 more cells
]
```

---

## ✨ Key Features

### ✅ **URL-Based Persistence**

- Game ID is in the URL
- After refresh, game state is restored from Supabase
- Users can bookmark or share game URLs

### ✅ **Realtime Sync**

- All connected clients see updates instantly
- Uses Supabase's postgres_changes subscription
- No polling required

### ✅ **Loading States**

- CircularProgress spinner while fetching game
- Green for controller, purple for player
- Prevents UI flash before data loads

### ✅ **Error Handling**

- If game not found, redirects to home with alert
- If Supabase error, shows error message
- Prevents broken states

### ✅ **Clean Navigation**

- Uses React Router's `useNavigate` hook
- Proper back/forward browser button support
- Clean URLs without hash routing

---

## 🚀 How to Use

### **As Controller:**

1. Open app and click "New Game"
2. Share the 6-digit room code with players
3. Make moves - all players see updates instantly
4. If you refresh, your game state is restored
5. Click "Play Again" to end game and return to home

### **As Player:**

1. Open app and click "Join Game"
2. Enter 6-digit room code
3. Watch the board update as controller makes moves
4. If you refresh, your view is restored
5. When controller ends game, you're redirected to home

---

## 🔧 Technical Notes

### **Dependencies Added:**

- `react-router-dom` - URL routing

### **No localStorage:**

- All persistence is in Supabase
- State is synced across devices
- Multiple tabs can view the same game

### **Realtime Channels:**

- Each game has its own channel: `game-${gameId}`
- Channels are cleaned up on component unmount
- Prevents memory leaks

### **URL as Source of Truth:**

- Game ID in URL is the single source of truth
- On mount/refresh, always read from URL
- Fetch fresh data from Supabase

---

## 🎯 Summary

Your game now has **production-ready refresh handling** with:

- ✅ URL-based routing
- ✅ Supabase persistence
- ✅ Realtime synchronization
- ✅ Proper refresh handling
- ✅ Clean error states
- ✅ Loading indicators
- ✅ Multi-device support

**NO localStorage used** - everything is in Supabase and synced in real-time! 🎉

