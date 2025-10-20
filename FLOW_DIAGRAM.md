# 🎯 Game Flow Diagram

## Complete User Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BROWSER OPENS APP                           │
│                              URL: /                                  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  EntryModal    │
                    │   Component    │
                    └───────┬────────┘
                            │
            ┌───────────────┴───────────────┐
            │                               │
            ▼                               ▼
    ┌──────────────┐              ┌──────────────┐
    │ "New Game"   │              │ "Join Game"  │
    │   Button     │              │   Button     │
    └──────┬───────┘              └──────┬───────┘
           │                             │
           ▼                             ▼
┌──────────────────────┐       ┌──────────────────┐
│ 1. Generate gameId   │       │ 1. User enters   │
│    (UUID)            │       │    6-digit code  │
│ 2. Generate sharedId │       │ 2. Search        │
│    (6-digit)         │       │    Supabase by   │
│ 3. Create board      │       │    sharedId      │
│    (25 cells)        │       │ 3. Get gameId    │
│ 4. Insert to         │       │                  │
│    Supabase          │       │                  │
└──────┬───────────────┘       └──────┬───────────┘
       │                              │
       │ navigate("/game/:gameId")    │ navigate("/play/:gameId")
       │                              │
       ▼                              ▼
┌─────────────────┐           ┌─────────────────┐
│  Controller     │           │   Player View   │
│  (Game.js)      │           │ (PlayerView.js) │
│  URL: /game/xyz │           │  URL: /play/xyz │
└────────┬────────┘           └────────┬────────┘
         │                             │
         ▼                             ▼
┌─────────────────────────────────────────────────┐
│         Both Subscribe to Supabase              │
│         Realtime Channel: "game-xyz"            │
└─────────────────────────────────────────────────┘
```

---

## Refresh Scenarios

### Scenario A: Controller Refreshes

```
┌────────────────────────────────────────────────────────┐
│  Controller is playing game at /game/abc-123          │
│  - Board has some cells captured                      │
│  - Current team: purple                               │
└────────────────┬───────────────────────────────────────┘
                 │
                 │ ⟳ REFRESH (F5)
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│  Browser reloads /game/abc-123                        │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│  Game.js mounts:                                       │
│  1. useParams() → gameId = "abc-123"                  │
│  2. loadGameFromDatabase()                            │
│     - SELECT * FROM games WHERE gameId='abc-123'      │
│  3. setBoard(data.boardState)                         │
│  4. setCurrentTeam(data.currentTeam)                  │
│  5. setSharedId(data.sharedId)                        │
│  6. Subscribe to realtime                             │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│  ✅ Game restored exactly as it was!                   │
│  - Same board state                                   │
│  - Same current team                                  │
│  - Same room code                                     │
│  - Ready to continue playing                          │
└────────────────────────────────────────────────────────┘
```

---

### Scenario B: Player Refreshes

```
┌────────────────────────────────────────────────────────┐
│  Player is viewing game at /play/abc-123              │
│  - Watching controller's moves                        │
└────────────────┬───────────────────────────────────────┘
                 │
                 │ ⟳ REFRESH (F5)
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│  Browser reloads /play/abc-123                        │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│  PlayerView.js mounts:                                 │
│  1. useParams() → gameId = "abc-123"                  │
│  2. loadGameFromDatabase()                            │
│     - SELECT * FROM games WHERE gameId='abc-123'      │
│  3. setBoard(data.boardState)                         │
│  4. setCurrentTeam(data.currentTeam)                  │
│  5. Subscribe to realtime (UPDATE + DELETE)           │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│  ✅ Player view restored!                              │
│  - Same board state                                   │
│  - Same team indicator                                │
│  - Receiving live updates again                       │
└────────────────────────────────────────────────────────┘
```

---

## Realtime Update Flow

### Controller Makes a Move

```
┌─────────────────────────────────────────────────────────────┐
│  Controller clicks cell, chooses green                      │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  handleQuestionAnswer() executes:                           │
│  1. Update local state: setBoard(updatedBoard)             │
│  2. Calculate scores: setGreenScore(), setPurpleScore()    │
│  3. UPDATE Supabase:                                        │
│     UPDATE games                                            │
│     SET boardState = [...], currentTeam = 'purple'         │
│     WHERE gameId = 'abc-123'                               │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                     Supabase Database                        │
│         (games table row updated)                           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ Postgres Change Event
                 │
                 ├──────────────┬──────────────┐
                 │              │              │
                 ▼              ▼              ▼
        ┌──────────────┐ ┌──────────┐ ┌──────────┐
        │ Controller   │ │ Player 1 │ │ Player 2 │
        │ (optional)   │ │          │ │          │
        └──────┬───────┘ └────┬─────┘ └────┬─────┘
               │              │             │
               ▼              ▼             ▼
        ┌────────────────────────────────────────┐
        │  Realtime callback triggered:          │
        │  - setBoard(payload.new.boardState)   │
        │  - setCurrentTeam(payload.new.team)   │
        │  - UI updates automatically           │
        └────────────────────────────────────────┘
```

---

## Game End Flow

### Controller Clicks "Play Again"

```
┌─────────────────────────────────────────────────────────────┐
│  Controller clicks "Play Again" button                      │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  handlePlayAgain() executes:                                │
│  1. DELETE FROM games WHERE gameId = 'abc-123'             │
│  2. navigate("/")                                           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Supabase: Game deleted                                     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ DELETE event broadcast
                 │
                 ├─────────────────┬──────────────┐
                 ▼                 ▼              ▼
        ┌──────────────┐  ┌──────────┐  ┌──────────┐
        │ Controller   │  │ Player 1 │  │ Player 2 │
        │ redirected   │  │          │  │          │
        │ to "/"       │  │          │  │          │
        └──────────────┘  └────┬─────┘  └────┬─────┘
                               │             │
                               ▼             ▼
                  ┌─────────────────────────────────┐
                  │  DELETE callback triggered:     │
                  │  - Show alert: "Game ended"    │
                  │  - navigate("/")               │
                  └─────────────────────────────────┘
```

---

## State Management Model

### Old Model (Before)

```
┌──────────────┐
│   App.js     │  ← All state here
│  (Parent)    │
└──────┬───────┘
       │ Props passed down
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
┌──────────┐   ┌──────────┐   ┌──────────┐
│EntryModal│   │  Game.js │   │PlayerView│
└──────────┘   └──────────┘   └──────────┘

Problem: No URL persistence, state lost on refresh
```

### New Model (After)

```
┌──────────────────────────────────────────────────┐
│            URL = Source of Truth                 │
│  /game/abc-123  or  /play/abc-123               │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│         Supabase Database (Persistent)           │
│         games table with gameId                  │
└────────────────┬─────────────────────────────────┘
                 │
         Fetch on mount / Subscribe
                 │
     ┌───────────┼───────────┐
     │           │           │
     ▼           ▼           ▼
┌──────────┐ ┌──────┐ ┌──────────┐
│EntryModal│ │Game  │ │PlayerView│
│(creates) │ │(host)│ │(watches) │
└──────────┘ └──────┘ └──────────┘

✅ Each component manages its own state
✅ URL contains gameId → refresh works
✅ Supabase syncs all clients
```

---

## Key Architectural Decisions

| Aspect      | Decision               | Reason                        |
| ----------- | ---------------------- | ----------------------------- |
| Routing     | React Router           | Standard, supports URL params |
| Persistence | Supabase only          | No localStorage needed        |
| State       | Component-level        | No global state needed        |
| Sync        | Realtime subscriptions | Instant updates, no polling   |
| Game ID     | UUID v4                | Secure, collision-resistant   |
| Room Code   | 6-digit number         | Easy to share verbally        |
| Loading     | CircularProgress       | Better UX, no flash           |
| Errors      | Alerts + redirect      | Clear feedback                |

---

## Success Metrics

✅ **Refresh works for both controller and player**
✅ **URL contains all needed info (gameId)**
✅ **Realtime updates sync instantly**
✅ **No localStorage used**
✅ **Loading states prevent UI flash**
✅ **Error handling redirects to safety**
✅ **Multi-tab/device support**
✅ **Clean, maintainable code**

---

## End Result

Your game is now **production-ready** with:

- Persistent game sessions
- URL-based routing
- Realtime synchronization
- Proper refresh handling
- Multi-device support

**No localStorage, pure Supabase magic! ✨**

