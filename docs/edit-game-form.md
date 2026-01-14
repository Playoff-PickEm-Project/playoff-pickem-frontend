# Edit Game Form Documentation

## Overview

The EditGameForm allows League Managers to modify an existing game's details and props. This is useful for correcting mistakes or updating game information before it starts.

## Component Location

**File**: `src/Components/EditGameForm.js`

**Route**: `/league-home/:leagueName/edit-game/:gameId`

**Access**: League Manager clicks "Edit" button on game in League Manager Panel

---

## Purpose

- Load existing game data
- Allow editing of game name, date, time
- Allow editing of existing props
- Allow adding new props
- Allow removing props
- Submit updates to backend

---

## URL Parameters

**useParams** (line 11):

```javascript
const { leagueName, gameId } = useParams();
```

- `leagueName`: League name from URL
- `gameId`: Game ID to edit

---

## State Management

**Local State** (lines 13-21):

```javascript
const [game, setGame] = useState(null);
const [gameName, setGameName] = useState('');
const [gameDate, setGameDate] = useState('');
const [startTime, setStartTime] = useState('');
const [questions, setQuestions] = useState([]);
const [loading, setLoading] = useState(true);
const [submitting, setSubmitting] = useState(false);
const [username, setUsername] = useState(null);
```

**State Purposes**:
- `game`: Original game object from backend
- `gameName`: Editable game name
- `gameDate`: Editable game date
- `startTime`: Editable start time
- `questions`: Array of all props (editable)
- `loading`: Initial data fetch state
- `submitting`: Form submission state
- `username`: Logged-in user's email

---

## Key Functions

### 1. useEffect - Load Game Data

**Location**: Lines 23-120

**Purpose**: Fetch game details and populate form

**API Calls** (sequential):

**Step 1**: Get logged-in username (line 29)
```javascript
GET /check_logged_in
```

**Step 2**: Get game by ID (line 44)
```javascript
GET /get_game_by_id?game_id=${gameId}
```

**Data Population** (lines 52-112):
- Sets game state (line 52)
- Sets gameName (line 53)
- Sets gameDate (line 54)
- Sets startTime (line 55)

**Prop Conversion** (lines 58-111):
- Converts winner/loser props to question format (lines 59-68)
- Converts over/under props to question format (lines 71-79)
- Converts variable option props to question format (lines 82-96)
- Combines all into questions array (line 99)

**Dependencies**: `[gameId]` (line 119) - Runs when gameId changes

---

### 2. handleUpdateGame()

**Location**: Lines 122-212

**Purpose**: Submit updated game data to backend

**Validation** (lines 125-133):
- Check game name not empty
- Check at least one prop exists
- Alert if validation fails

**Payload Construction** (lines 135-165):

**Base Game Data**:
```javascript
{
  gameId: parseInt(gameId),
  gameName,
  gameDate,
  startTime,
  leagueName,
  username
}
```

**Prop Arrays** (lines 151-165):
- Filters questions by field_type
- Separates into winnerLoserProps, overUnderProps, variableOptionProps
- Includes is_mandatory for each prop
- Preserves existing prop IDs if present

**API Call** (lines 167-187):
```javascript
POST /edit_game
Body: gameData
```

**Success Handling** (lines 189-195):
- Shows success alert
- Navigates to league manager panel

**Error Handling** (lines 196-207):
- Shows error alert
- Logs to console
- Keeps form open for retry

**CRITICAL**: Includes `credentials: 'include'` (line 174)

---

### 3. Prop Management Functions

**Same as GameFormBuilder**:
- `addQuestion(type)` - Add new prop
- `removeQuestion(index)` - Remove prop
- `handleQuestionChange(index, field, value)` - Update prop field
- `addOption(questionIndex)` - Add option to variable prop
- `removeOption(questionIndex, optionIndex)` - Remove option
- `handleOptionChange(...)` - Update option field

**Implementation**: Lines 214-285 (identical to GameFormBuilder pattern)

---

## Form Structure

**Layout**: Same as GameFormBuilder

**Sections**:
1. Game details (name, date, time)
2. Add prop buttons
3. Existing props (editable)
4. Update/Cancel buttons

**Key Difference from Create**:
- Pre-populated with existing data
- "Update Game" button instead of "Create Game"
- Preserves prop IDs when updating

---

## Prop ID Preservation

**Important**: When editing existing props, must preserve their IDs

**Implementation** (lines 151-157):
```javascript
winnerLoserProps: questions
  .filter(q => q.field_type === 'select_winner')
  .map(q => ({
    id: q.id,  // Include existing ID if present
    favorite_team: q.favorite_team,
    // ... other fields
  }))
```

**Why**: Backend uses ID to update existing prop vs create new one

**New Props**: Don't have ID field, backend creates new records

---

## Common Errors

### 1. "Game not found"

**Cause**: Invalid gameId in URL

**Check**: Verify game exists (line 44)

**Debug**: Log response from `/get_game_by_id`

---

### 2. Props not loading

**Cause**: Prop conversion failed or data structure mismatch

**Check**: Console for errors (line 113)

**Debug**: Log game object before conversion (line 52)

---

### 3. Update fails with validation error

**Cause**: Missing required fields or invalid data

**Backend Response**: 400 error with description

**Check**: Error message in alert (line 201)

---

### 4. New props added but old props lost

**Cause**: Not preserving prop IDs in payload

**Fix**: Include `id` field for existing props (line 153)

---

## API Integration

### Endpoints Used

**1. GET /check_logged_in** (line 29)

**2. GET /get_game_by_id** (line 44)
- Query param: `game_id`
- Response: Full game object with all props

**3. POST /edit_game** (line 167)
- Body: Updated game data with props
- Response: Success message

**CRITICAL**: All requests include `credentials: 'include'`

---

## Restrictions

### Cannot Edit After Game Starts

**Business Rule**: Games should not be editable after they start

**Frontend Check**: Could add validation to disable form if game started

**Recommended Addition**:
```javascript
if (game && new Date(game.start_time) <= new Date()) {
  return <div>Game has already started, cannot edit</div>;
}
```

**Backend Validation**: Should also enforce this rule

---

## Related Components

- [GameFormBuilder](./game-form-builder.md) - Similar structure
- [LeagueManagerPanel](./league-manager-panel.md) - Access point
- [GamePage](./game-page.md) - View edited game

---

## Backend Integration

- [Edit Game](../../playoff-pickem-backend/docs/game-create.md) - Backend endpoint
- [Game Model](../../playoff-pickem-backend/docs/game-create.md#database-schema) - Data structure

---

*Last Updated: January 2026*
