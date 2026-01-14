# Grade Game Form Documentation

## Overview

The GradeGameForm allows League Managers to manually set correct answers for props and trigger the grading process. This is used when games don't have ESPN links (no auto-grading) or to override auto-graded results.

## Component Location

**File**: `src/Components/GradeGameForm.js`

**Route**: `/league-home/:leagueName/grade-game/:gameId`

**Access**: League Manager clicks "Grade" button on completed game

---

## Purpose

- Display all props for a game
- Allow commissioner to set correct answer for each prop
- Submit correct answers to backend
- Trigger points calculation for all players
- Display grading results (player points)

---

## URL Parameters

**useParams** (line 10):

```javascript
const { leagueName, gameId } = useParams();
```

- `leagueName`: League name from URL
- `gameId`: Game ID to grade

---

## State Management

**Local State** (lines 12-17):

```javascript
const [game, setGame] = useState(null);
const [correctAnswers, setCorrectAnswers] = useState({});
const [loading, setLoading] = useState(true);
const [submitting, setSubmitting] = useState(false);
const [gradingResults, setGradingResults] = useState(null);
```

**State Purposes**:
- `game`: Game object with all props
- `correctAnswers`: Object mapping prop IDs to correct answers
- `loading`: Initial data fetch state
- `submitting`: Grading submission state
- `gradingResults`: Player points after grading

---

## Key Functions

### 1. useEffect - Load Game Data

**Location**: Lines 19-49

**Purpose**: Fetch game details and pre-populate correct answers

**API Call** (line 25):
```javascript
GET /get_game_by_id?game_id=${gameId}
```

**Response Handling** (lines 29-41):
- Sets game state (line 29)
- Pre-populates correctAnswers with existing correct_answer values (lines 32-40)
- Allows re-grading (changing correct answers)

**Error Handling** (lines 42-46):
- Logs error to console
- Sets loading to false

**Dependencies**: `[gameId]` (line 48)

---

### 2. handleCorrectAnswerChange()

**Location**: Lines 51-58

**Purpose**: Update correct answer for a prop

**Parameters**:
- `propType`: "winner_loser", "over_under", "variable_option"
- `propId`: Prop's database ID
- `answer`: Correct answer value

**Logic** (lines 52-57):
```javascript
setCorrectAnswers(prev => ({
  ...prev,
  [`${propType}_${propId}`]: answer
}));
```

**Key Format**: Composite key `{propType}_{propId}`

---

### 3. handleGradeGame()

**Location**: Lines 60-138

**Purpose**: Submit correct answers and grade game

**Step 1**: Set Correct Answers (lines 67-105)

**API Calls** (for each prop type):
```javascript
POST /set_correct_answer_winner_loser
POST /set_correct_answer_over_under
POST /set_correct_answer_variable_option
```

**Body for each**:
```javascript
{
  prop_id: propId,
  correct_answer: answer
}
```

**Step 2**: Grade Game (lines 108-120)

**API Call**:
```javascript
POST /grade_game
Body: { game_id: parseInt(gameId) }
```

**Response Handling** (lines 122-128):
- Sets gradingResults state
- Shows player points
- Displays success message

**Error Handling** (lines 129-133):
- Shows error alert
- Logs to console

**CRITICAL**: All requests include `credentials: 'include'`

---

## Form Display

### Winner/Loser Props

**Location**: Lines 148-195

**For Each Prop**:
- Shows team names with point values
- Shows current score (if available)
- Two radio buttons (one per team)
- Pre-selected if correct_answer already set

**Example** (lines 165-189):
```javascript
<label>
  <input
    type="radio"
    name={`winner_${prop.id}`}
    value={prop.team_a_name}
    checked={correctAnswers[`winner_loser_${prop.id}`] === prop.team_a_name}
    onChange={(e) => handleCorrectAnswerChange('winner_loser', prop.id, e.target.value)}
  />
  {prop.team_a_name} ({prop.favorite_points} pts)
</label>
```

---

### Over/Under Props

**Location**: Lines 200-255

**For Each Prop**:
- Shows player name, stat type, line value
- Shows current_value (if live stats available)
- Two radio buttons: "Over" and "Under"
- Pre-selected if correct_answer already set

**Example** (lines 225-249):
```javascript
<label>
  <input
    type="radio"
    name={`over_under_${prop.id}`}
    value="over"
    checked={correctAnswers[`over_under_${prop.id}`] === 'over'}
    onChange={(e) => handleCorrectAnswerChange('over_under', prop.id, e.target.value)}
  />
  Over {prop.line_value}
</label>
```

---

### Variable Option Props

**Location**: Lines 260-316

**For Each Prop**:
- Shows question text
- Radio buttons for each option
- Shows option points
- Pre-selected if correct_answer already set

**Example** (lines 281-305):
```javascript
{prop.options.map(option => (
  <label key={option.id}>
    <input
      type="radio"
      name={`variable_${prop.id}`}
      value={option.choice_text}
      checked={correctAnswers[`variable_option_${prop.id}`] === option.choice_text}
      onChange={(e) => handleCorrectAnswerChange('variable_option', prop.id, e.target.value)}
    />
    {option.choice_text} ({option.points} pts)
  </label>
))}
```

---

## Grading Results Display

**Location**: Lines 318-345

**Condition**: Only shown after grading submitted (`gradingResults !== null`)

**Display** (lines 322-344):
- Section title: "Grading Results"
- Maps over players array
- Shows player name and total points
- Format: "player@gmail.com: 45 points"

**Data Source**: `gradingResults.players` from `/grade_game` response

---

## Submit Section

**Location**: Lines 347-360

**Grade Game Button** (lines 351-358):
- Green background
- Full width
- Disabled when submitting
- Text: "Grade Game" or "Grading..." (when submitting)
- Calls handleGradeGame()

---

## Common Errors

### 1. "Prop not found"

**Cause**: Invalid prop_id in correctAnswers

**Debug**: Check prop IDs match game data

**Prevention**: Use prop.id from game object

---

### 2. "Invalid answer"

**Cause**: Answer doesn't match expected format

**Examples**:
- Winner/Loser: Must match team_a_name or team_b_name exactly
- Over/Under: Must be "over" or "under" (lowercase)
- Variable Option: Must match option.choice_text exactly

**Backend Validation**: Checks answer validity

---

### 3. Grading results not showing

**Cause**: API call failed or response format unexpected

**Check**: Console for errors (line 131)

**Debug**: Log gradingResults state (line 125)

---

### 4. Points not updating in league

**Cause**: Frontend showing cached data

**Solution**: Navigate back to league home, refresh shows updated standings

---

## Re-grading Workflow

**Purpose**: Change correct answers and recalculate points

**Steps**:
1. Load GradeGameForm (shows existing correct_answer values)
2. Change correct answer selections
3. Click "Grade Game"
4. Backend sets new correct answers
5. Backend recalculates all player points
6. Frontend shows updated results

**Backend Logic** (gradeGameService.py:90-182):
- Resets all players' points for this game to 0
- Recalculates based on new correct answers
- Updates player.points

---

## Auto-Grading Integration

**When**: Game with ESPN link completes

**Auto-Grading** (liveStatsService.py:121-129):
- Sets correct_answer automatically based on stats
- Calls grade_game automatically
- Commissioner can still manually override

**Manual Override**:
1. Open GradeGameForm
2. Change any correct answers
3. Submit
4. New answers replace auto-graded ones

---

## API Integration

### Endpoints Used

**1. GET /get_game_by_id** (line 25)
- Query param: `game_id`
- Response: Game object with props and correct_answer values

**2. POST /set_correct_answer_winner_loser** (line 70)
- Body: `{ prop_id, correct_answer }`
- Response: Success message

**3. POST /set_correct_answer_over_under** (line 83)
- Body: `{ prop_id, correct_answer }`
- Response: Success message

**4. POST /set_correct_answer_variable_option** (line 96)
- Body: `{ prop_id, correct_answer }`
- Response: Success message

**5. POST /grade_game** (line 108)
- Body: `{ game_id }`
- Response: `{ message, players: [...] }`

**CRITICAL**: All requests include `credentials: 'include'`

---

## Related Components

- [GamePage](./game-page.md) - View game being graded
- [LeagueHome](./league-home.md) - See updated standings
- [LeagueManagerPanel](./league-manager-panel.md) - Access point

---

## Backend Integration

- [Set Correct Answers](../../playoff-pickem-backend/docs/grading-manual.md) - Backend endpoints
- [Grade Game](../../playoff-pickem-backend/docs/grading-manual.md#grade-game-endpoint) - Points calculation
- [Auto-Grading](../../playoff-pickem-backend/docs/grading-auto.md) - Automatic grading

---

*Last Updated: January 2026*
