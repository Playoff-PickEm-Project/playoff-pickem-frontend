# Game Form Builder Documentation

## Overview

The GameFormBuilder is the comprehensive form used by League Managers to create new games with props. It includes ESPN game selection, prop creation (winner/loser, over/under, variable option), mandatory/optional configuration, and prop limit settings.

## Component Location

**File**: `src/Components/GameFormBuilder.js`

**Route**: `/league-home/:leagueName/create-game`

**Access**: League Manager clicks "Create Game" in League Manager Panel

---

## Purpose

- Create new game with name, date, time
- Link to ESPN game for live stats (optional)
- Add multiple props of different types
- Configure each prop as mandatory or optional
- Set prop_limit (how many optional props players must select)
- Submit complete game to backend

---

## URL Parameters

**useParams** (line 11):

```javascript
const { leagueName } = useParams();
```

- `leagueName`: League name from URL

---

## State Management

**Local State** (lines 13-22):

```javascript
const [gameName, setGameName] = useState('');
const [gameDate, setGameDate] = useState('');
const [startTime, setStartTime] = useState('');
const [questions, setQuestions] = useState([]);
const [espnGames, setEspnGames] = useState([]);
const [selectedEspnGame, setSelectedEspnGame] = useState(null);
const [username, setUsername] = useState(null);
const [loading, setLoading] = useState(false);
const [propLimit, setPropLimit] = useState(2);
```

**State Purposes**:
- `gameName`: Game display name
- `gameDate`: Date in YYYY-MM-DD format
- `startTime`: Time in HH:MM format
- `questions`: Array of prop objects (all types)
- `espnGames`: Available ESPN games for selected date
- `selectedEspnGame`: Chosen ESPN game for live stats
- `username`: Logged-in user's email
- `loading`: Form submission state
- `propLimit`: Number of optional props players must select (default: 2)

---

## Key Functions

### 1. useEffect - Get Username

**Location**: Lines 24-42

**Purpose**: Fetch logged-in username on component mount

**API Call** (line 30):
```javascript
GET /check_logged_in
```

**Response Handling** (lines 34-36):
- Sets username state
- Used in game creation API call

**Error Handling** (lines 37-39):
- Logs error to console

**Dependencies**: `[]` (line 41) - Runs once on mount

---

### 2. useEffect - Fetch ESPN Games

**Location**: Lines 44-73

**Purpose**: Fetch available ESPN games when date selected

**Trigger**: When `gameDate` changes (line 72)

**API Call** (line 51):
```javascript
GET /get_espn_games?date=${gameDate}
```

**Response Handling** (lines 55-63):
- Sets espnGames state
- Filters games for selected date
- Provides list for dropdown

**Error Handling** (lines 64-68):
- Logs error to console
- Sets espnGames to empty array

**Dependencies**: `[gameDate]` (line 72)

---

### 3. addQuestion()

**Location**: Lines 75-114

**Purpose**: Add a new prop to the form

**Parameters**:
- `type`: "select_winner", "over_under", "variable_option"

**Default Values by Type**:

**Winner/Loser** (lines 79-88):
```javascript
{
  field_type: 'select_winner',
  favorite_team: '',
  underdog_team: '',
  favorite_points: 0,
  underdog_points: 0,
  is_mandatory: true  // DEFAULT: mandatory
}
```

**Over/Under** (lines 89-97):
```javascript
{
  field_type: 'over_under',
  player_name: '',
  stat_type: '',
  line_value: 0,
  points: 0,
  is_mandatory: false  // DEFAULT: optional
}
```

**Variable Option** (lines 98-105):
```javascript
{
  field_type: 'variable_option',
  question_text: '',
  options: [],
  is_mandatory: false  // DEFAULT: optional
}
```

**State Update** (lines 107-109):
- Appends new question to `questions` array

---

### 4. removeQuestion()

**Location**: Lines 116-118

**Purpose**: Remove a prop from the form

**Parameters**:
- `index`: Index in questions array

**Implementation**:
```javascript
setQuestions(questions.filter((_, i) => i !== index));
```

---

### 5. handleQuestionChange()

**Location**: Lines 120-125

**Purpose**: Update a prop's field value

**Parameters**:
- `index`: Question index
- `field`: Field name (e.g., "favorite_team")
- `value`: New value

**Implementation** (lines 121-124):
```javascript
const updatedQuestions = [...questions];
updatedQuestions[index][field] = value;
setQuestions(updatedQuestions);
```

---

### 6. addOption()

**Location**: Lines 127-134

**Purpose**: Add new option to variable option prop

**Parameters**:
- `questionIndex`: Index of variable option prop

**New Option Structure** (lines 129-132):
```javascript
{
  choice_text: '',
  points: 0
}
```

---

### 7. removeOption()

**Location**: Lines 136-142

**Purpose**: Remove option from variable option prop

**Parameters**:
- `questionIndex`: Prop index
- `optionIndex`: Option index

---

### 8. handleOptionChange()

**Location**: Lines 144-151

**Purpose**: Update option field value

**Parameters**:
- `questionIndex`: Prop index
- `optionIndex`: Option index
- `field`: "choice_text" or "points"
- `value`: New value

---

### 9. handleCreateGame()

**Location**: Lines 88-217

**Purpose**: Submit complete game to backend

**Validation** (lines 157-165):
- Check game name not empty
- Check at least one prop added
- Alert if validation fails

**Payload Construction** (lines 167-179):

**Base Game Data**:
```javascript
{
  gameName: gameName,
  gameDate: gameDate,
  startTime: startTime,
  leagueName: leagueName,
  username: username,
  external_game_id: selectedEspnGame?.id || null,
  propLimit: propLimit  // ADDED for prop selection feature
}
```

**Prop Arrays** (lines 181-189):
- `winnerLoserProps`: Array of winner/loser props with `is_mandatory`
- `overUnderProps`: Array of over/under props with `is_mandatory`
- `variableOptionProps`: Array of variable option props with `is_mandatory`

**Prop Filtering** (lines 191-193):
```javascript
questions.filter(q => q.field_type === 'select_winner')
```

**Include is_mandatory** (lines 135-137, 153, 161):
```javascript
favorite_team: q.favorite_team,
underdog_team: q.underdog_team,
is_mandatory: q.is_mandatory,
// ... other fields
```

**API Call** (lines 195-214):
```javascript
POST /create_game
Body: gameData
```

**Success Handling** (lines 216-222):
- Shows success alert
- Navigates to league manager panel
- Clears form

**Error Handling** (lines 204-215):
- Safari iOS workaround for "Load failed" bug (see [Known Issues](./known-issues.md))
- Checks if error message contains "load fail"
- Treats Safari bug as success (backend confirms creation succeeds)
- Real network errors still properly reported
- Logs to console
- Keeps form data for real errors

**CRITICAL**: Includes `credentials: 'include'` (line 192)

---

## Form Sections

### 1. Game Details Section

**Location**: Lines 248-324

**Fields**:

**Game Name** (lines 252-264):
- Text input
- Required
- Example: "Rams vs Panthers - Wild Card"

**Game Date** (lines 266-278):
- Date picker (YYYY-MM-DD)
- Required
- Triggers ESPN games fetch

**Start Time** (lines 280-292):
- Time picker (HH:MM)
- Required
- Used for locking prop answers

**ESPN Game Selection** (lines 294-322):
- Dropdown of ESPN games for selected date
- Optional (for live stats)
- Shows team matchups
- Stores ESPN game ID

---

### 2. Prop Limit Section

**Location**: Lines 471-488

**Purpose**: Set how many optional props players must select

**Input Field** (lines 476-486):
- Number input
- Min: 1
- Max: 20
- Default: 2
- Label: "Number of Optional Props Players Must Answer"

**Value Handling** (line 485):
```javascript
onChange={(e) => setPropLimit(parseInt(e.target.value) || 2)}
```

---

### 3. Add Prop Buttons

**Location**: Lines 326-368

**Three Buttons**:

**Add Winner/Loser Prop** (lines 330-342):
- Blue button
- Calls `addQuestion('select_winner')`
- Default: is_mandatory = true

**Add Over/Under Prop** (lines 344-356):
- Green button
- Calls `addQuestion('over_under')`
- Default: is_mandatory = false

**Add Variable Option Prop** (lines 358-366):
- Purple button
- Calls `addQuestion('variable_option')`
- Default: is_mandatory = false

---

### 4. Prop Forms

**Winner/Loser Prop Form** (lines 376-618):

**Fields** (lines 499-618):
- Mandatory Checkbox (lines 529-544)
- Favorite Team Name (lines 546-560)
- Favorite Points (lines 562-576)
- Underdog Team Name (lines 578-592)
- Underdog Points (lines 594-608)
- Remove Button (lines 610-616)

**Mandatory Checkbox** (lines 529-544):
```javascript
<input
  type="checkbox"
  id={`mandatory-${questionIndex}`}
  checked={question.is_mandatory !== undefined ? question.is_mandatory : (question.field_type === 'select_winner')}
  onChange={(e) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].is_mandatory = e.target.checked;
    setQuestions(updatedQuestions);
  }}
/>
<label>Mandatory prop (all players must answer)</label>
```

**Over/Under Prop Form** (lines 620-796):

**Fields** (lines 649-796):
- Mandatory Checkbox (same pattern as above)
- Player Name (lines 668-682)
- Stat Type (lines 684-698)
- Line Value (lines 700-714)
- Points (lines 716-730)
- Remove Button (lines 732-738)

**Variable Option Prop Form** (lines 798-1008):

**Fields** (lines 827-1008):
- Mandatory Checkbox (same pattern)
- Question Text (lines 846-860)
- Options List (lines 862-974)
  - Choice Text input
  - Points input
  - Remove Option button
- Add Option Button (lines 976-988)
- Remove Prop Button (lines 990-996)

---

### 5. Submit Section

**Location**: Lines 1012-1032

**Create Game Button** (lines 1016-1030):
- Green background
- Full width
- Disabled when loading
- Text changes to "Creating..." when submitting
- Calls handleCreateGame()

---

## Prop Display Headers

**Winner/Loser Header** (lines 491-497):
- Title: "Winner/Loser Prop #{index + 1}"
- Shows prop number
- Blue text

**Over/Under Header** (lines 641-647):
- Title: "Over/Under Prop #{index + 1}"
- Shows prop number
- Green text

**Variable Option Header** (lines 819-825):
- Title: "Variable Option Prop #{index + 1}"
- Shows prop number
- Purple text

---

## Input Validation

**Frontend Validation**:
- Game name required (line 157)
- At least one prop required (line 161)
- All fields required (enforced by input `required` attribute)

**Backend Validation**:
- Validates prop data structure
- Checks user is commissioner
- Ensures league exists

---

## Common Errors

### 1. "Please enter a game name"

**Cause**: Submitted form without game name

**Fix**: Enter game name (line 157)

---

### 2. "Please add at least one question"

**Cause**: Submitted form without any props

**Fix**: Click "Add [Type] Prop" button (line 161)

---

### 3. ESPN games not loading

**Cause**: Invalid date or API error

**Check**: Console for errors (line 66)

**Debug**: Verify date format YYYY-MM-DD (line 51)

---

### 4. Form submission fails

**Cause**: Backend validation error or missing required fields

**Check**: Error message in alert (line 228)

**Debug**: Inspect payload in network tab (line 167)

---

### 5. Mandatory checkbox not working

**Cause**: is_mandatory field not updating

**Check**: onChange handler (lines 536-540)

**Verify**: Checkbox checked state (line 534)

---

## API Integration

### Endpoints Used

**1. GET /check_logged_in** (line 30)
- Get current user's username

**2. GET /get_espn_games** (line 51)
- Get ESPN games for date
- Query param: `date` (YYYY-MM-DD)
- Response: Array of ESPN game objects

**3. POST /create_game** (line 195)
- Create new game with props
- Body: Complete game data with props
- Response: Created game object

**CRITICAL**: Include `credentials: 'include'` (line 202)

---

## Related Components

- [EditGameForm](./edit-game-form.md) - Edit existing game
- [LeagueManagerPanel](./league-manager-panel.md) - Access point
- [GamePage](./game-page.md) - View created game

---

## Backend Integration

- [Create Game](../../playoff-pickem-backend/docs/game-create.md) - Backend endpoint
- [ESPN Integration](../../playoff-pickem-backend/docs/live-stats-polling.md) - Live stats

---

## Business Logic

### Why Default Winner/Loser to Mandatory?

**Standard Game Structure**: Every game typically has a "who wins" prop

**Simplicity**: Most games have 1 mandatory winner/loser prop + optional props

**Override Available**: Commissioner can uncheck if desired

---

### Why Allow Multiple Prop Types?

**Variety**: Different props test different knowledge/strategy

**Engagement**: Mix of team props and player props keeps it interesting

**Flexibility**: League Manager controls game complexity

---

### Why Set Prop Limit?

**Fairness**: All players answer same number of optional props

**Strategy**: Forces choices, tests knowledge depth

**Balance**: Prevents answering all props (removes skill element)

---

## Known Issues

### Safari iOS "Load failed" Error

**Symptom**: On iPhone/iPad, creating a game shows "Network error: Load failed" but game is actually created successfully.

**Impact**: Cosmetic only - game creates on backend, user sees incorrect error

**Workaround**: Implemented in `handleCreateGame()` catch block (lines 204-215)

**Full Details**: See [Known Issues Documentation](./known-issues.md#safari-ios-load-failed-error-on-post-requests)

---

*Last Updated: January 2026*
