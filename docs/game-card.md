# Game Card Component Documentation

## Overview

The GameCard component displays a single game in the league home view. It shows game details, player's selections, and provides click-through to the full game page or prop selection modal depending on game status.

## Component Location

**File**: `src/Components/HomeView/GameCard.js`

**Parent Component**: `LeagueHome.js` (renders multiple game cards in grid)

---

## Purpose

- Display game overview (teams, date, status)
- Show player's prop selections for the game
- Provide access to prop selection modal (upcoming games)
- Navigate to game page (live/completed games)
- Display game status badge (upcoming, live, completed)

---

## Component Props

**Props Accepted**:

```javascript
{
  game: object,          // Game object with all props and selections
  leagueName: string,    // Current league name
  playerId: number,      // Current player's ID
  apiUrl: string         // Backend API base URL
}
```

**game Object Structure**:
- `id`: Game ID
- `game_name`: Display name
- `game_date`: ISO date string
- `start_time`: ISO datetime string
- `is_completed`: Boolean
- `prop_limit`: Number of optional props to select
- `winner_loser_props`: Array of winner/loser props
- `over_under_props`: Array of over/under props
- `variable_option_props`: Array of variable option props

---

## State Management

**Local State** (lines 8-9):

```javascript
const [showPropModal, setShowPropModal] = useState(false);
const [gameData, setGameData] = useState(game);
```

- `showPropModal`: Boolean controlling PropSelectionModal visibility
- `gameData`: Current game object (updates after selections change)

---

## Key Functions

### 1. handleCardClick()

**Location**: Lines 11-37

**Purpose**: Handle clicks on the game card

**Logic** (lines 14-35):

**If game is upcoming** (lines 15-18):
- Game hasn't started yet
- Opens PropSelectionModal
- Allows player to select props

**If game is live or completed** (lines 19-23):
- Game already started or finished
- Navigates to full GamePage
- Shows answers and grading

**Check Logic** (line 15):
```javascript
if (new Date(gameData.start_time) > new Date())
```

**Navigation** (line 22):
```javascript
navigate(`/league-home/${leagueName}/game/${gameData.id}`)
```

---

### 2. handleSelectionsUpdated()

**Location**: Lines 39-67

**Purpose**: Refresh game data after prop selections change

**API Call** (line 43):
```javascript
GET /get_game_by_id?game_id=${gameData.id}
```

**Response Handling** (lines 51-59):
- Updates `gameData` state with fresh data
- Includes updated prop selections
- Triggers re-render to show new selections

**Error Handling** (lines 60-63):
- Logs error to console
- Doesn't crash component

**When Called**: After PropSelectionModal successfully submits selections

---

## Game Status Badge

**Location**: Lines 76-88

**Badge Types**:

**Upcoming** (lines 77-79):
```javascript
<span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
  Upcoming
</span>
```

**Live** (lines 80-82):
```javascript
<span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
  Live
</span>
```

**Completed** (lines 83-85):
```javascript
<span className="bg-gray-500 text-white px-2 py-1 rounded text-xs">
  Completed
</span>
```

**Determination Logic**:
- Upcoming: `start_time > now`
- Live: `start_time <= now` AND `is_completed = false`
- Completed: `is_completed = true`

---

## Prop Selection Display

**Location**: Lines 90-140

**Section Header** (lines 90-93):
```
Your Selections (2/3 selected)
```

**Count Calculation** (lines 91-92):
- Sums up all selected props across all types
- Format: `{count} / {prop_limit} selected`

### Rendering Selected Props

**Winner/Loser Props** (lines 95-107):
- Filters for props where `player_selected = true`
- Displays: "Winner/Loser: {team_a_name} vs {team_b_name}"
- Shows player's answer if available

**Over/Under Props** (lines 109-121):
- Same filter logic
- Displays: "Over/Under: {player_name} - {stat_type}"
- Shows player's answer (over/under) if available

**Variable Option Props** (lines 123-135):
- Same filter logic
- Displays: "Variable: {question_text}"
- Shows player's answer if available

**Player Answer Display** (lines 100-103, etc.):
```javascript
{prop.player_answer && (
  <span className="text-sm text-gray-600"> - Your answer: {prop.player_answer}</span>
)}
```

---

## Empty State

**Location**: Lines 138-140

**When Shown**: No props selected yet

**Message**: "No props selected yet. Click to select props!"

**Purpose**: Encourage player to open modal and make selections

---

## Styling Details

**Card Container** (lines 71-75):
- White background
- Border with shadow
- Rounded corners
- Padding: p-4
- Hover effect: cursor pointer
- Click handler attached

**Status Badge** (lines 76-88):
- Small rounded pill
- Color-coded by status
- Positioned at top

**Prop List** (lines 94-136):
- Vertical spacing: space-y-2
- Each prop on own line
- Bold prop type labels
- Gray answer text

---

## PropSelectionModal Integration

**Modal Component** (lines 142-149):

```javascript
<PropSelectionModal
  isOpen={showPropModal}
  onClose={() => setShowPropModal(false)}
  game={gameData}
  playerId={playerId}
  apiUrl={apiUrl}
  onSelectionsUpdated={handleSelectionsUpdated}
/>
```

**Props Passed**:
- `isOpen`: Controls visibility
- `onClose`: Closes modal
- `game`: Current game data
- `playerId`: For API calls
- `apiUrl`: Backend URL
- `onSelectionsUpdated`: Callback to refresh game data

---

## User Flow

### Upcoming Game Flow

1. Player sees game card with "Upcoming" badge
2. Player clicks card
3. PropSelectionModal opens
4. Player selects props
5. Player submits selections
6. Modal closes
7. handleSelectionsUpdated() fetches fresh data
8. Card re-renders with updated selections

### Live/Completed Game Flow

1. Player sees game card with "Live" or "Completed" badge
2. Player clicks card
3. Navigates to full GamePage
4. Can view answers, live stats, grading

---

## Common Errors

### 1. Modal not opening on click

**Cause**: Game start_time has passed

**Check**: Verify `new Date(gameData.start_time) > new Date()` (line 15)

**Expected**: Should navigate to GamePage instead

---

### 2. Selections not updating after submission

**Cause**: handleSelectionsUpdated() not called or failed

**Debug**: Check console for API errors (line 62)

**Verify**: Modal passes `onSelectionsUpdated` callback (line 148)

---

### 3. Wrong selection count displayed

**Cause**: Backend not returning `player_selected` flag correctly

**Check**: API response from `/get_game_by_id`

**Expected**: Each prop should have `player_selected: true/false`

---

### 4. "No props selected" always showing

**Cause**: No props have `player_selected = true`

**Check**: Player actually selected props in modal

**Verify**: Prop selection API calls succeeded

---

## API Integration

### Endpoints Used

**1. GET /get_game_by_id** (line 43):
- Fetch full game details
- Query param: `game_id`
- Returns: Game object with props and selections
- Includes `player_selected` flags for each prop

**CRITICAL**: Include `credentials: 'include'` (line 47)

---

## Related Components

- [PropSelectionModal](./prop-selection-modal.md) - Modal for selecting props
- [GamePage](./game-page.md) - Full game view
- [LeagueHome](./league-home.md) - Parent component rendering cards

---

## Backend Integration

- [Get Game Endpoint](../../playoff-pickem-backend/docs/game-create.md) - `/get_game_by_id`
- [Prop Selection](../../playoff-pickem-backend/docs/prop-selection.md) - Selection API

---

## Business Logic

### Why Different Click Behavior?

**Upcoming Games**:
- Player needs to select props
- Modal is quick selection interface
- Prevents accidental navigation away

**Live/Completed Games**:
- Selection is locked
- Full page shows live stats, grading
- Player wants to see details, not select

### Why Show Selections on Card?

**Quick Overview**: Player can see what they've selected without opening modal

**Selection Tracking**: Reminds player if they haven't selected yet

**Visual Feedback**: Confirms selections were saved

---

*Last Updated: January 2026*
