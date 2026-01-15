# Prop Selection Flow Documentation

## Overview

This document describes the complete user journey for the prop selection feature, from game creation to final grading. It shows how mandatory and optional props work together across the entire workflow.

---

## Complete Flow Diagram

```
League Manager Creates Game
    → Sets prop_limit (e.g., 2 optional props required)
    → Marks props as mandatory or optional
    ↓
Game Created with Props
    → 1 mandatory winner/loser prop
    → 4 optional props (over/under, variable)
    ↓
Player Views Game (Upcoming)
    → Sees all 5 props
    → Clicks "Select Props" button or game card
    ↓
Prop Selection Modal Opens
    → Shows mandatory props (auto-selected, grayed out)
    → Shows optional props (player must select 2)
    → Selection counter shows "0 / 2 selected"
    ↓
Player Selects Optional Props
    → Clicks checkbox on Prop A
    → Clicks checkbox on Prop B
    → Counter shows "2 / 2 selected"
    → Submit button enables
    ↓
Player Submits Selections
    → API calls: deselect all, then select chosen props
    → Modal closes
    → Game card refreshes
    ↓
Player Answers Props
    → Opens game page
    → Answers mandatory prop (auto-selected)
    → Answers selected optional props (A, B)
    → Can still see unselected props (C, D) but marked differently
    ↓
Player Can Change Selections (Before Game Starts)
    → Reopens prop selection modal
    → Deselects Prop A
    → Selects Prop C instead
    → Re-submits
    → Previous answers persist (A, B, C all answered)
    ↓
Game Starts
    → Prop selection locked
    → Answers locked
    → Live stats begin updating
    ↓
Game Completes
    → Auto-grading triggered (if ESPN linked)
    → Correct answers set based on actual results
    ↓
Grading Awards Points
    → Mandatory prop: Always graded (all players)
    → Optional Prop A: NOT graded (player deselected)
    → Optional Prop B: Graded (player selected, answered correctly)
    → Optional Prop C: Graded (player selected, answered correctly)
    ↓
Final Standings Updated
    → Player's total points updated
    → Leaderboard refreshed
```

---

## Workflow Stages

### Stage 1: Game Creation

**Actor**: League Manager (Commissioner)

**Component**: `GameFormBuilder.js`

**Actions**:
1. Enter game details (name, date, time)
2. Link ESPN game (optional, for live stats)
3. Set **prop_limit** (e.g., 2) - number of optional props players must select
4. Add props:
   - Add winner/loser prop → Check "Mandatory" (default checked)
   - Add over/under prop 1 → Leave "Mandatory" unchecked (optional)
   - Add over/under prop 2 → Leave unchecked
   - Add variable option prop 1 → Leave unchecked
   - Add variable option prop 2 → Leave unchecked
5. Submit game

**Result**: Game created with 1 mandatory prop, 4 optional props, prop_limit = 2

**Backend**: `POST /create_game` (gameService.py:224-282)

---

### Stage 2: Prop Selection

**Actor**: Player

**Component**: `PropSelectionModal.js` (opened from `GameCard.js`)

**Trigger**: Click on upcoming game card

**Modal Display**:
- **Mandatory Props Section**:
  - Winner/Loser prop shown
  - Checkbox checked, disabled (grayed out)
  - Label: "Mandatory - all players must answer"

- **Optional Props Section**:
  - 4 optional props shown
  - All checkboxes unchecked, enabled
  - Counter: "0 / 2 selected"

**Player Actions**:
1. Click checkbox on "Player A passing yards over/under"
2. Counter updates: "1 / 2 selected"
3. Click checkbox on "Team total points variable option"
4. Counter updates: "2 / 2 selected"
5. Submit button enables (was disabled)
6. Click "Submit Selections"

**API Calls**:
1. `POST /deselect_prop` (for each existing selection)
2. `POST /select_prop` (for each new selection)

**Backend**: `propSelectionService.py:15-76`

**Result**: PlayerPropSelection records created for mandatory prop + 2 selected optional props

---

### Stage 3: Answering Props

**Actor**: Player

**Component**: `GamePage.js`

**Navigation**: Click game card (after selections made) or direct URL

**Page Display**:
- **Mandatory Prop**: Shows checkmark (selected), answer buttons enabled
- **Selected Optional Props**: Show checkmarks, answer buttons enabled
- **Unselected Optional Props**: No checkmark, answer buttons still enabled (but won't be graded)

**Player Actions**:
1. Answer mandatory winner/loser prop → Select "Rams"
2. Answer optional prop 1 (passing yards) → Select "Over"
3. Answer optional prop 2 (team points) → Select "24-27 points"
4. Optionally answer unselected props (answers saved but won't count)

**API Calls** (for each answer):
```javascript
POST /answer_winner_loser_prop
POST /answer_over_under_prop
POST /answer_variable_option_prop
```

**Backend**: `gameService.py:81-221`

**Result**: Answer records created for all answered props (selected or not)

---

### Stage 4: Changing Selections (Optional)

**Actor**: Player

**Component**: `PropSelectionModal.js`

**Trigger**: Reopen modal before game starts

**Scenario**: Player wants to swap optional prop 1 for optional prop 3

**Actions**:
1. Open prop selection modal
2. Uncheck optional prop 1 (passing yards)
3. Check optional prop 3 (receiving yards)
4. Still have 2/2 selected
5. Submit

**API Calls**:
1. `POST /deselect_prop` (all current selections)
2. `POST /select_prop` (new selections: mandatory, optional prop 2, optional prop 3)

**Important**: Answer for optional prop 1 still exists in database (not deleted)

**Result**: PlayerPropSelection records updated, previous answers persist

---

### Stage 5: Game Starts

**Trigger**: Current time >= game.start_time

**Automatic Changes**:
- Prop selection locked (can't change selections)
- Answer submission locked (can't change answers)
- Game status badge changes from "Upcoming" to "Live"
- Live stats polling begins (if ESPN linked)

**Frontend Behavior**:
- Clicking game card now navigates to GamePage (not modal)
- Answer buttons disabled
- Live scores/stats display

**Backend**: Live stats polling (liveStatsService.py:14-131)

---

### Stage 6: Live Stats Updates

**Trigger**: Game is live (started but not completed)

**Backend Polling**: Every 30 seconds (schedulerService.py)

**Updates**:
- Winner/Loser props: team_a_score, team_b_score updated
- Over/Under props: current_value updated (player stats)
- Frontend polls game data every 30 seconds

**Frontend Display** (GamePage.js):
- Shows live scores next to winner/loser prop
- Shows current stat value next to over/under prop
- Color codes: green if correct, red if incorrect (based on current value)

---

### Stage 7: Game Completes

**Trigger**: ESPN game status = "STATUS_FINAL"

**Backend Auto-Actions** (liveStatsService.py:121-129):
1. Set `game.is_completed = True`
2. Call `auto_grade_props_from_live_data()`
3. Call `grade_game()`

**Auto-Grading** (gradeGameService.py:29-68):
- Winner/Loser props: Set correct_answer based on higher score
- Over/Under props: Set correct_answer based on current_value vs line_value
- Variable Option props: Not auto-graded (commissioner sets manually)

---

### Stage 8: Points Awarded

**Function**: `grade_game()` (gradeGameService.py:90-182)

**Logic for Each Player**:

**Mandatory Props** (lines 116-131):
```
For each winner/loser prop:
  - Get player's answer
  - Check if answer matches correct_answer
  - If correct: Add points to player.points
  - NO selection check (mandatory props always counted)
```

**Optional Props** (lines 133-175):
```
For each over/under prop:
  - Check if player selected this prop (lines 147-149)
  - If NOT selected: Skip (continue to next prop)
  - If selected: Get player's answer
  - Check if answer matches correct_answer
  - If correct: Add points to player.points

For each variable option prop:
  - Same logic (lines 165-167)
```

**Critical Check** (lines 147-149, 165-167):
```python
if not prop.is_mandatory:
    if not _has_player_selected_prop(player.id, game.id, 'over_under', prop.id):
        continue  # Skip grading this prop
```

**Example Scenario**:
- Player selected: Mandatory prop, Optional prop 2, Optional prop 3
- Player answered correctly: Mandatory prop, Optional prop 1, Optional prop 2
- Points awarded for: Mandatory prop (10 pts), Optional prop 2 (5 pts)
- Points NOT awarded for: Optional prop 1 (not selected), Optional prop 3 (answered incorrectly)

---

### Stage 9: Leaderboard Update

**Trigger**: After grade_game() completes

**Backend**: `player.points` updated in database

**Frontend**: Leaderboard polls every 30 seconds (LeagueHome.js:112-149)

**Display**: Updated standings on league home page

---

## Key Business Rules

### Rule 1: Mandatory Props Always Graded

**Why**: All players must answer, ensures fairness

**Implementation**: No selection check in grading logic (gradeGameService.py:116-131)

---

### Rule 2: Optional Props Only Graded if Selected

**Why**: Players choose which props to play (strategy element)

**Implementation**: Selection check before awarding points (gradeGameService.py:147-149, 165-167)

---

### Rule 3: Answers Persist Even if Deselected

**Why**: Allows players to change selections without losing work

**Implementation**: Answer records never deleted, only selection records updated

**User Benefit**: Can answer all props, then decide which to "lock in"

---

### Rule 4: prop_limit Enforced at Selection Time

**Why**: Ensures all players answer same number of optional props

**Implementation**: Frontend validation in PropSelectionModal (lines 76-82)

**Backend Validation**: Could be added for extra safety

---

### Rule 5: Selection Locked When Game Starts

**Why**: Can't change strategy after results are known

**Implementation**: Frontend checks game.start_time (GamePage.js:106)

**UI Change**: Modal no longer opens, checkboxes disabled

---

## Error Scenarios

### Scenario 1: Player Selects Wrong Number of Props

**When**: Tries to submit with 1/2 props selected

**Prevention**: Submit button disabled (PropSelectionModal.js:202-203)

**Error Message**: "Please select exactly 2 optional props" (line 79)

---

### Scenario 2: Player Tries to Select After Game Starts

**When**: Game already started, player clicks card

**Prevention**: Modal doesn't open, navigates to GamePage instead (GameCard.js:15-23)

**UI**: Game status badge shows "Live" or "Completed"

---

### Scenario 3: Player Answers Prop But Doesn't Select It

**When**: Answers all props, only selects 2

**Result**: Answer saved, but not graded

**Grading**: Skipped during grade_game() (gradeGameService.py:147-149)

**User Education**: Modal shows which props are selected (checkmarks)

---

## Testing Checklist

### Frontend Testing

- [ ] Mandatory props auto-selected and grayed out
- [ ] Selection counter accurate
- [ ] Submit button disabled until correct count
- [ ] Modal closes after successful submission
- [ ] Game card shows updated selections
- [ ] Can change selections before game starts
- [ ] Can't open modal after game starts
- [ ] Answers persist when selections change

### Backend Testing

- [ ] prop_limit saved to game model
- [ ] is_mandatory saved to each prop
- [ ] PlayerPropSelection records created correctly
- [ ] Deselect removes records
- [ ] Select creates records
- [ ] Grading checks selections for optional props
- [ ] Grading skips selection check for mandatory props
- [ ] Points awarded correctly based on selections

---

## Related Documentation

- [PropSelectionModal Component](./prop-selection-modal.md)
- [GamePage Component](./game-page.md)
- [GameCard Component](./game-card.md)
- [Backend Prop Selection](../../playoff-pickem-backend/docs/prop-selection.md)
- [Backend Grading](../../playoff-pickem-backend/docs/grading-manual.md)

---

*Last Updated: January 2026*
