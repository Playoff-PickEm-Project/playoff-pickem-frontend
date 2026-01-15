# Game Page Documentation

## Overview

The GamePage is the detailed view for a single game. It displays all props, allows players to answer them, shows live statistics during the game, and displays grading results after completion.

## Component Location

**File**: `src/Components/HomeView/Game/GamePage.js`

**Route**: `/league-home/:leagueName/game/:gameId`

**Access**: Clicked from GameCard or direct URL

---

## Purpose

- Display all game props with full details
- Allow players to submit answers to props
- Show live statistics during game (polls every 30 seconds)
- Display grading results after game completes
- Show player's prop selections
- Handle prop selection/deselection

---

## URL Parameters

**useParams** (line 12):

```javascript
const { leagueName, gameId } = useParams();
```

- `leagueName`: League name from URL
- `gameId`: Game ID from URL

---

## State Management

**Local State** (lines 14-23):

```javascript
const [game, setGame] = useState(null);
const [loading, setLoading] = useState(true);
const [playerId, setPlayerId] = useState(null);
const [answers, setAnswers] = useState({});
const [submitting, setSubmitting] = useState(false);
const [username, setUsername] = useState(null);
const [isCommissioner, setIsCommissioner] = useState(false);
const [selectedProps, setSelectedProps] = useState([]);
const [selectingProps, setSelectingProps] = useState(false);
```

**State Purposes**:
- `game`: Full game object with props, stats, grading
- `loading`: Initial data fetch state
- `playerId`: Current player's ID
- `answers`: Object mapping prop IDs to player's answers
- `submitting`: Answer submission state
- `username`: Logged-in user's email
- `isCommissioner`: Whether user is league manager
- `selectedProps`: Array of selected prop objects `{prop_type, prop_id}`
- `selectingProps`: Prop selection submission state

---

## Key Functions

### 1. useEffect - Initial Data Load

**Location**: Lines 25-103

**Purpose**: Fetch game data and player info on component mount

**API Calls** (sequential):

**Step 1**: Get logged-in username (line 31)
```javascript
GET /check_logged_in
```

**Step 2**: Get player ID (line 43)
```javascript
GET /get_player_id?username=${username}&leagueName=${leagueName}
```

**Step 3**: Get game details (line 58)
```javascript
GET /get_game_by_id?game_id=${gameId}
```

**Response Handling** (lines 66-92):
- Sets game state (line 68)
- Checks if user is commissioner (lines 71-73)
- Pre-populates answers object with existing answers (lines 76-91)
- Sets loading to false (line 93)

**Error Handling** (lines 94-99):
- Logs error to console
- Sets loading to false
- Shows error state to user

**Dependencies**: `[gameId, leagueName]` (line 102)

---

### 2. useEffect - Live Stats Polling

**Location**: Lines 105-139

**Purpose**: Poll game data every 30 seconds for live updates

**Condition** (line 106):
```javascript
if (!game || game.is_completed || new Date(game.start_time) > new Date())
```
- Skip if no game data
- Skip if game completed
- Skip if game hasn't started yet

**Polling Logic** (lines 108-135):
- Fetch game data every 30 seconds
- Update game state with fresh data
- Includes live scores and stats

**Cleanup** (line 137):
- Clears interval when component unmounts
- Prevents memory leaks

**Dependencies**: `[game?.id, game?.is_completed, game?.start_time]` (line 138)

---

### 3. useEffect - Load Prop Selections

**Location**: Lines 141-179

**Purpose**: Fetch player's prop selections when game loads

**API Call** (line 153):
```javascript
GET /get_player_prop_selections?player_id=${playerId}&game_id=${gameId}
```

**Response Handling** (lines 161-170):
- Maps selections to `{prop_type, prop_id}` format
- Sets selectedProps state
- Used to show checkmarks on selected props

**Error Handling** (lines 171-175):
- Logs error to console
- Doesn't crash component

**Dependencies**: `[playerId, gameId, apiUrl]` (line 178)

---

### 4. handleAnswerChange()

**Location**: Lines 181-188

**Purpose**: Update local answers state when player changes answer

**Parameters**:
- `propType`: "winner_loser", "over_under", "variable_option"
- `propId`: Prop's database ID
- `answer`: Player's answer value

**Logic** (lines 182-187):
```javascript
setAnswers(prev => ({
  ...prev,
  [`${propType}_${propId}`]: answer
}));
```

**Key Format**: Uses composite key `{propType}_{propId}` to store answers

---

### 5. handleSubmitAnswer()

**Location**: Lines 190-267

**Purpose**: Submit a single prop answer to backend

**Parameters**: Same as handleAnswerChange

**Answer Retrieval** (line 195):
```javascript
const answer = answers[`${propType}_${propId}`];
```

**Validation** (lines 197-200):
- Check answer exists
- Alert if missing

**Endpoint Mapping** (lines 202-207):
```javascript
const endpoints = {
  winner_loser: '/answer_winner_loser_prop',
  over_under: '/answer_over_under_prop',
  variable_option: '/answer_variable_option_prop'
};
```

**API Call** (lines 209-221):
```javascript
POST {endpoint}
Body: { username, leagueName, prop_id: propId, answer }
```

**Success Handling** (lines 223-239):
- Shows success alert
- Refreshes game data to show updated answer
- Updates UI

**Error Handling** (lines 240-260):
- Shows error alert with message
- Logs to console
- Doesn't lose player's answer input

**CRITICAL**: Includes `credentials: 'include'` (line 215)

---

### 6. handleSelectProp()

**Location**: Lines 269-327

**Purpose**: Add a prop to player's selections

**Validation** (lines 273-283):
- Get optional props count
- Check if already at prop_limit
- Alert if limit reached

**API Call** (lines 285-301):
```javascript
POST /select_prop
Body: { player_id: playerId, game_id: gameId, prop_type: propType, prop_id: propId }
```

**Success Handling** (lines 303-311):
- Adds to selectedProps state
- Shows success alert
- Updates UI immediately

**Error Handling** (lines 312-321):
- Shows error alert
- Logs to console

**CRITICAL**: Includes `credentials: 'include'` (line 293)

---

### 7. handleDeselectProp()

**Location**: Lines 329-377

**Purpose**: Remove a prop from player's selections

**API Call** (lines 336-352):
```javascript
POST /deselect_prop
Body: { player_id: playerId, game_id: gameId, prop_type: propType, prop_id: propId }
```

**Success Handling** (lines 354-363):
- Removes from selectedProps state
- Shows success alert
- Updates UI immediately

**Error Handling** (lines 364-371):
- Shows error alert
- Logs to console

**CRITICAL**: Includes `credentials: 'include'` (line 344)

---

### 8. isPropSelected()

**Location**: Lines 379-386

**Purpose**: Check if a prop is currently selected

**Parameters**:
- `propType`: Prop type string
- `propId`: Prop ID number

**Logic** (lines 380-385):
```javascript
return selectedProps.some(
  selection => selection.prop_type === propType && selection.prop_id === propId
);
```

**Returns**: Boolean (true if selected, false otherwise)

**Usage**: Determines checkbox state and button visibility

---

### 9. getOptionalSelectedCount()

**Location**: Lines 388-411

**Purpose**: Count how many optional props player has selected

**Logic**:
1. Filter selectedProps for those in this game (lines 390-405)
2. Filter out mandatory props (lines 407-409)
3. Return count

**Why Important**: Enforces prop_limit constraint

**Used By**: handleSelectProp() validation (line 278)

---

## Prop Rendering

### Winner/Loser Props

**Location**: Lines 479-568

**Display** (lines 484-492):
- Team names with "vs"
- Point values (favorite/underdog)
- Status badge (mandatory/optional)

**Selection Checkbox** (lines 494-505):
- Only shown for optional props before game starts
- Checked if prop is selected
- Calls handleSelectProp/handleDeselectProp

**Answer Buttons** (lines 507-540):
- Two buttons (one per team)
- Highlights selected answer (blue background)
- Disabled after game starts
- Shows player's saved answer

**Submit Button** (lines 542-552):
- Only shown before game starts
- Calls handleSubmitAnswer with answer
- Green background

**Live Stats** (lines 554-567):
- Shows current scores during/after game
- Format: "Team A: 28 | Team B: 24"
- Only visible if game started

---

### Over/Under Props

**Location**: Lines 573-673

**Display** (lines 578-587):
- Player name, stat type
- Line value
- Point value
- Status badge

**Selection Checkbox** (lines 589-600):
- Same logic as winner/loser

**Answer Buttons** (lines 602-635):
- "Over" and "Under" buttons
- Highlights selected (blue background)
- Disabled after game starts

**Submit Button** (lines 637-647):
- Same logic as winner/loser

**Live Stats** (lines 649-672):
- Shows current stat value
- Format: "Current: 245.5 yards"
- Color-coded: green if over, red if under
- Shows player's answer vs actual result

---

### Variable Option Props

**Location**: Lines 678-774

**Display** (lines 683-690):
- Question text
- Point value
- Status badge

**Selection Checkbox** (lines 692-703):
- Same logic as other prop types

**Answer Buttons** (lines 705-740):
- One button per option
- Shows option text and points
- Highlights selected (blue background)
- Disabled after game starts

**Submit Button** (lines 742-752):
- Same logic as other prop types

**Correct Answer Display** (lines 754-773):
- Shows correct answer after grading
- Format: "Correct Answer: {answer}"
- Green background
- Only visible if game completed and graded

---

## Grading Display

**Location**: Lines 422-446

**Condition**: Only shown if `game.is_completed === true`

**Player Points** (lines 427-433):
- Shows current player's total points
- Format: "Your Points: 150"
- Bold, large text

**All Players Scores** (lines 435-445):
- Lists all players in league
- Shows each player's points
- Format: "player@gmail.com: 150 points"
- Sorted by points (highest first)

---

## Status Badge Component

**Location**: Lines 448-461

**Badge Types**:
- Upcoming (blue): Game hasn't started
- Live (green): Game in progress
- Completed (gray): Game finished

**Determination**:
- Upcoming: `start_time > now`
- Live: `start_time <= now` AND `is_completed = false`
- Completed: `is_completed = true`

---

## Loading and Error States

**Loading State** (lines 781-783):
```javascript
if (loading) return <div>Loading game...</div>;
```

**No Game State** (lines 785-787):
```javascript
if (!game) return <div>Game not found</div>;
```

---

## Common Errors

### 1. "Failed to fetch" on page load

**Cause**: Backend not running or CORS issue

**Check**: Console network tab (line 97)

**Verify**: `credentials: 'include'` in all fetch calls

---

### 2. Answers not saving

**Cause**: API call failed or wrong endpoint

**Debug**: Check console for error (line 256)

**Verify**: Answer matches validation (e.g., "over" or "under" for over/under props)

---

### 3. Live stats not updating

**Cause**: Polling not running or game status incorrect

**Check**: Verify `is_completed = false` and `start_time <= now` (line 106)

**Debug**: Add console.log in polling useEffect (line 110)

---

### 4. Can't select more props

**Cause**: Already at prop_limit

**Expected**: Alert shown (line 280)

**Solution**: Deselect a prop first, then select new one

---

### 5. Commissioner buttons not showing

**Cause**: `isCommissioner` is false

**Check**: Verify user is league commissioner (line 71)

**Debug**: Log `game.commissioner_id` and `playerId`

---

## API Integration

### Endpoints Used

**1. GET /check_logged_in** (line 31)

**2. GET /get_player_id** (line 43)

**3. GET /get_game_by_id** (lines 58, 114)

**4. POST /answer_winner_loser_prop** (line 209)

**5. POST /answer_over_under_prop** (line 209)

**6. POST /answer_variable_option_prop** (line 209)

**7. POST /select_prop** (line 285)

**8. POST /deselect_prop** (line 336)

**9. GET /get_player_prop_selections** (line 153)

**CRITICAL**: All requests include `credentials: 'include'`

---

## Related Components

- [GameCard](./game-card.md) - Links to this page
- [PropSelectionModal](./prop-selection-modal.md) - Alternative selection UI
- [GradeGameForm](./grade-game-form.md) - Commissioner grading

---

## Backend Integration

- [Answer Props](../../playoff-pickem-backend/docs/prop-answer.md) - Answer submission
- [Prop Selection](../../playoff-pickem-backend/docs/prop-selection.md) - Selection APIs
- [Live Stats](../../playoff-pickem-backend/docs/live-stats-polling.md) - Polling logic
- [Grading](../../playoff-pickem-backend/docs/grading-manual.md) - Points calculation

---

## Business Logic

### Why Allow Answer Changes?

Players can change answers before game starts to:
- Correct mistakes
- React to breaking news (injuries, weather)
- Adjust strategy

**Implementation**: UPDATE existing answer instead of creating duplicate

---

### Why Real-time Polling?

**User Experience**: Players want to see live scores without refreshing

**Implementation**: Poll every 30 seconds during live games

**Optimization**: Only poll games that are live (not upcoming or completed)

---

### Why Separate Select and Answer?

**Selection**: Which props to play (strategy)

**Answer**: Prediction for each selected prop

**Benefits**:
- Can answer all props, then decide which to select
- Answers persist even if deselected (can reselect later)
- Clean separation of concerns

---

*Last Updated: January 2026*
