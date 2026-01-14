# Prop Selection Modal Documentation

## Overview

The PropSelectionModal is a critical UI component that allows players to choose which props they want to answer before a game starts. It separates mandatory props (automatically selected) from optional props (player chooses up to prop_limit).

## Component Location

**File**: `src/Components/HomeView/Game/PropSelectionModal.js`

**Parent Component**: `GameCard.js` (renders modal when upcoming game card is clicked)

---

## Purpose

- Display all props for an upcoming game
- Separate mandatory vs optional props visually
- Allow selection/deselection of optional props
- Enforce prop_limit constraint (e.g., must select exactly 2 optional props)
- Submit selections to backend via API
- Prevent submission until correct number selected

---

## Component Props

**Props Accepted**:

```javascript
{
  isOpen: boolean,              // Controls modal visibility
  onClose: function,            // Callback to close modal
  game: object,                 // Game object with props
  playerId: number,             // Current player's ID
  apiUrl: string,               // Backend API base URL
  onSelectionsUpdated: function // Callback after successful submission
}
```

**game Object Structure**:
- `id`: Game ID
- `prop_limit`: Number of optional props to select
- `winner_loser_props`: Array of winner/loser props
- `over_under_props`: Array of over/under props
- `variable_option_props`: Array of variable option props

---

## State Management

**Local State** (lines 7-9):

```javascript
const [selectedProps, setSelectedProps] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

- `selectedProps`: Array of objects `{prop_type, prop_id}`
- `loading`: Boolean for submission state
- `error`: Error message string or null

---

## Key Functions

### 1. useEffect - Load Existing Selections

**Location**: Lines 11-49

**Purpose**: Fetch player's existing prop selections when modal opens

**API Call**:
```javascript
GET /get_player_prop_selections?player_id=${playerId}&game_id=${game.id}
```

**Response Handling** (lines 25-35):
- Maps selections to `{prop_type, prop_id}` format
- Pre-populates `selectedProps` state
- Auto-selects all mandatory props

**Dependency**: `[isOpen, playerId, game?.id]` - Runs when modal opens or IDs change

---

### 2. togglePropSelection()

**Location**: Lines 51-71

**Purpose**: Handle checkbox clicks for optional props

**Logic**:
- If prop already selected → Remove from array (line 55-60)
- If prop not selected → Add to array (line 62-67)
- Mandatory props cannot be toggled (handled by disabled checkbox)

**Parameters**:
- `propType`: "winner_loser", "over_under", or "variable_option"
- `propId`: Prop's database ID

---

### 3. handleSubmit()

**Location**: Lines 73-128

**Purpose**: Submit selections to backend

**Validation** (lines 76-82):
- Count optional props selected
- Check if count matches `game.prop_limit`
- Show error if mismatch

**API Calls** (lines 84-117):

**Step 1**: Deselect all existing props
```javascript
POST /deselect_prop
Body: { player_id, game_id, prop_type, prop_id }
```

**Step 2**: Select new props
```javascript
POST /select_prop
Body: { player_id, game_id, prop_type, prop_id }
```

**Why Two Steps**: Ensures clean slate (removes old selections before adding new)

**Success Handling** (line 119):
- Calls `onSelectionsUpdated()` callback
- Closes modal via `onClose()`

**Error Handling** (lines 121-126):
- Logs error to console
- Sets error message in state

---

## Prop Categorization

### Mandatory Props

**Identification** (lines 136-141):
```javascript
const mandatoryProps = [
  ...(game.winner_loser_props?.filter(p => p.is_mandatory) || []),
  ...(game.over_under_props?.filter(p => p.is_mandatory) || []),
  ...(game.variable_option_props?.filter(p => p.is_mandatory) || [])
];
```

**Rendering** (lines 159-172):
- Auto-checked checkboxes
- Disabled (cannot uncheck)
- Grayed out styling

---

### Optional Props

**Identification** (lines 143-148):
```javascript
const optionalProps = [
  ...(game.winner_loser_props?.filter(p => !p.is_mandatory) || []),
  ...(game.over_under_props?.filter(p => !p.is_mandatory) || []),
  ...(game.variable_option_props?.filter(p => !p.is_mandatory) || [])
];
```

**Rendering** (lines 184-197):
- Clickable checkboxes
- Enabled/disabled based on prop_limit
- Blue highlight when selected

---

## Selection Count Display

**Location**: Lines 175-182

**Visual Indicator**:
```
Selected: 2 / 2 optional props
```

**Color Coding**:
- Green text if count matches prop_limit (line 178)
- Red text if count doesn't match (line 179)

---

## Submit Button State

**Location**: Lines 200-211

**Disabled When**:
- Loading state is true (line 202)
- Optional prop count ≠ prop_limit (line 203)

**Button Text**:
- "Submitting..." when loading
- "Submit Selections" otherwise

**Styling**: Grayed out when disabled (line 204)

---

## Prop Display Format

**Winner/Loser Props** (lines 162-168):
```
☑ Winner/Loser: Team A vs Team B
```

**Over/Under Props** (lines 189-193):
```
☑ Over/Under: Player Name - Stat Type (Line Value)
```

**Variable Option Props** (lines 194-197):
```
☑ Variable Option: Question Text
```

**Type Indicator**: `{prop.prop_type || 'winner_loser'}` (line 165)

---

## Common Errors

### 1. "Please select exactly N optional props"

**Cause**: Player tried to submit without selecting correct number

**Prevention**: Submit button disabled until count matches

**Location**: Lines 76-82

---

### 2. Selections not persisting

**Cause**: API call failed but modal closed anyway

**Check**: Error logged to console (line 124)

**Debug**: Verify `credentials: 'include'` in fetch calls (lines 92, 105)

---

### 3. Mandatory props showing as unselected

**Cause**: `is_mandatory` not set correctly on prop

**Check**: Verify backend returned `is_mandatory: true`

**Filter Logic**: Lines 136-141

---

### 4. Can't deselect optional prop

**Cause**: Selection count already at minimum (0)

**Expected Behavior**: All optional props should be deselectable

**Logic**: Lines 55-60 (remove from array)

---

## API Integration

### Endpoints Used

**1. GET /get_player_prop_selections** (line 17):
- Fetch existing selections
- Query params: `player_id`, `game_id`
- Returns: Array of selection objects

**2. POST /deselect_prop** (line 88):
- Remove a prop selection
- Body: `{player_id, game_id, prop_type, prop_id}`
- Response: Success message

**3. POST /select_prop** (line 101):
- Add a prop selection
- Body: `{player_id, game_id, prop_type, prop_id}`
- Response: Success message

**CRITICAL**: All requests include `credentials: 'include'` (lines 19, 92, 105)

---

## User Flow

1. Player clicks on upcoming game card
2. Modal opens, shows all props
3. Mandatory props auto-selected (grayed out)
4. Player clicks checkboxes for optional props
5. Selection counter updates in real-time
6. Submit button enables when count matches prop_limit
7. Player clicks "Submit Selections"
8. Loading state shows "Submitting..."
9. Backend processes deselect/select API calls
10. Modal closes on success
11. GameCard refreshes to show updated selections

---

## Styling Details

**Modal Container** (lines 132-134):
- Fixed positioning, centered
- Semi-transparent black backdrop
- z-index for overlay

**Modal Content** (line 135):
- White background
- Rounded corners
- Max width 2xl
- Scrollable content area

**Checkbox Styling** (lines 164, 190):
- Blue accent color when checked
- Gray border when unchecked
- Disabled state grayed out

**Button Colors**:
- Blue background (enabled)
- Gray background (disabled)
- Darker blue on hover

---

## Related Components

- [GameCard](./game-card.md) - Parent component that opens modal
- [GamePage](./game-page.md) - Alternative selection interface
- [PropDisplay](./prop-display.md) - Individual prop rendering

---

## Backend Integration

- [Prop Selection Backend](../../playoff-pickem-backend/docs/prop-selection.md) - API endpoints
- [Grading Logic](../../playoff-pickem-backend/docs/grading-manual.md) - How selections affect scoring

---

## Business Logic

### Why Separate Mandatory and Optional?

**Mandatory Props**:
- All players must answer these
- Usually 1 winner/loser prop per game
- No selection needed (auto-included)
- Always graded

**Optional Props**:
- Player chooses which to answer
- League Manager sets how many (prop_limit)
- Strategic choice adds skill element
- Only graded if selected

### Why Enforce prop_limit?

**Fairness**: All players answer same number of props

**Strategy**: Forces players to pick their most confident props

**Balance**: Prevents "answering everything" strategy

---

*Last Updated: January 2026*
