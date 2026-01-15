# League Home Page Documentation

## Overview

The LeagueHome component is the main dashboard for a league. It displays all games, the leaderboard, and provides access to league management tools for commissioners.

## Component Location

**File**: `src/Components/LeagueDashboard/LeagueHome.js`

**Route**: `/league-home/:leagueName`

**Access**: Selected from user's league list or direct URL

---

## Purpose

- Display all games in the league (past, present, future)
- Show league leaderboard with player standings
- Provide navigation to league management panel (commissioners only)
- Display league join code for inviting players
- Poll leaderboard for real-time updates during live games

---

## URL Parameters

**useParams** (line 10):

```javascript
const { leagueName } = useParams();
```

- `leagueName`: League name from URL

---

## State Management

**Local State** (lines 12-18):

```javascript
const [league, setLeague] = useState(null);
const [games, setGames] = useState([]);
const [loading, setLoading] = useState(true);
const [username, setUsername] = useState(null);
const [playerId, setPlayerId] = useState(null);
const [isCommissioner, setIsCommissioner] = useState(false);
```

**State Purposes**:
- `league`: League object with details
- `games`: Array of all games in league
- `loading`: Initial data fetch state
- `username`: Logged-in user's email
- `playerId`: Current player's ID in this league
- `isCommissioner`: Whether user is league manager

---

## Key Functions

### 1. useEffect - Initial Data Load

**Location**: Lines 20-110

**Purpose**: Fetch league, games, and player info on mount

**API Calls** (sequential):

**Step 1**: Get logged-in username (line 26)
```javascript
GET /check_logged_in
```

**Step 2**: Get player ID (line 38)
```javascript
GET /get_player_id?username=${username}&leagueName=${leagueName}
```

**Step 3**: Get league details (line 53)
```javascript
GET /get_league_info?leagueName=${leagueName}
```

**Step 4**: Get all games (line 71)
```javascript
GET /get_games_by_league?leagueName=${leagueName}
```

**Response Handling** (lines 79-101):
- Sets league state (line 79)
- Checks if user is commissioner (lines 82-84)
- Sets games state (line 89)
- Sorts games by date (lines 92-96)
- Sets loading to false (line 98)

**Error Handling** (lines 102-106):
- Logs error to console
- Sets loading to false

**Dependencies**: `[leagueName]` (line 109)

---

### 2. useEffect - Leaderboard Polling

**Location**: Lines 112-149

**Purpose**: Poll league data every 30 seconds for live leaderboard updates

**Condition** (line 113):
```javascript
if (!league) return;
```
- Skip if league not loaded

**Polling Logic** (lines 115-145):
- Fetch league info every 30 seconds
- Update league state with fresh player standings
- Keeps leaderboard current during live games

**Cleanup** (line 147):
- Clears interval when component unmounts

**Dependencies**: `[league?.league_name]` (line 148)

---

### 3. handleManageLeague()

**Location**: Lines 151-153

**Purpose**: Navigate to league manager tools

**Navigation**:
```javascript
navigate(`/league-home/${leagueName}/league_manager_tools`);
```

**Access Control**: Button only shown if `isCommissioner === true` (line 198)

---

### 4. handleCopyJoinCode()

**Location**: Lines 155-162

**Purpose**: Copy join code to clipboard

**Implementation** (line 157):
```javascript
navigator.clipboard.writeText(league.join_code);
```

**User Feedback** (line 158):
```javascript
alert('Join code copied to clipboard!');
```

**Fallback**: Alert with error if copy fails (line 160)

---

## Leaderboard Display

**Location**: Lines 218-243

**Section Header** (line 218):
```
Leaderboard
```

**Player List** (lines 221-242):
- Maps over `league.league_players`
- Sorted by points (highest first)
- Shows rank number (1, 2, 3, etc.)
- Shows player name (email)
- Shows total points

**Sorting** (lines 222-224):
```javascript
league.league_players
  .sort((a, b) => b.points - a.points)
  .map((player, index) => ...)
```

**Player Card Styling**:
- White background
- Border and shadow
- Padding and rounded corners
- Flexbox layout (name left, points right)

**Rank Display** (line 228):
```javascript
<span className="font-bold text-gray-700">#{index + 1}</span>
```

---

## Games Display

**Location**: Lines 245-261

**Section Header** (lines 245-249):
```
Games
```

**Game Grid** (lines 251-260):
- Grid layout: 1 column mobile, 2 columns md+, 3 columns lg+
- Gap spacing between cards
- Maps over `games` array
- Renders GameCard component for each game

**GameCard Props** (lines 254-259):
```javascript
<GameCard
  key={game.id}
  game={game}
  leagueName={leagueName}
  playerId={playerId}
  apiUrl={apiUrl}
/>
```

---

## Commissioner Controls

**Location**: Lines 196-214

**Condition**: Only shown if `isCommissioner === true` (line 198)

**Manage League Button** (lines 200-207):
- Navigates to league manager panel
- Blue background
- Hover effect
- Full width on mobile, auto width on larger screens

---

## League Info Display

**Location**: Lines 170-194

**League Name** (lines 174-176):
- Large, bold text
- Gray color

**Join Code Section** (lines 178-194):
- Label: "Join Code"
- Display: Large, monospace font for readability
- Copy Button: Copies to clipboard
- Indigo background
- Icon: Clipboard icon from Lucide React

**Join Code Styling** (lines 181-184):
```javascript
<p className="text-2xl font-mono font-bold text-gray-800 tracking-wide">
  {league.join_code}
</p>
```

---

## Loading and Error States

**Loading State** (lines 266-268):
```javascript
if (loading) {
  return <div className="text-center mt-10">Loading league data...</div>;
}
```

**No League State** (lines 270-272):
```javascript
if (!league) {
  return <div className="text-center mt-10">League not found</div>;
}
```

---

## Page Layout

**Container** (lines 165-263):
- Max width: 7xl
- Centered with `mx-auto`
- Padding: px-4, py-8
- Minimum height: screen height

**Sections**:
1. Header with league name
2. Join code display
3. Commissioner controls (conditional)
4. Leaderboard
5. Games grid

---

## Common Errors

### 1. "League not found"

**Cause**: Invalid league name in URL or league doesn't exist

**Check**: Verify league name is correct (line 53)

**Debug**: Check API response for 404 error

---

### 2. Leaderboard not updating

**Cause**: Polling not running or API call failing

**Check**: Console for errors (line 140)

**Verify**: Polling interval is set (line 115)

---

### 3. Games not displaying

**Cause**: No games created yet or API call failed

**Check**: `games` array length (line 245)

**Debug**: Log response from `/get_games_by_league` (line 89)

---

### 4. "Manage League" button not showing

**Cause**: User is not commissioner

**Expected**: Only commissioner sees button (line 198)

**Check**: `isCommissioner` state (line 82)

---

### 5. Join code copy not working

**Cause**: Browser doesn't support clipboard API or permissions denied

**Fallback**: Show join code, user copies manually (line 181)

**Check**: HTTPS required for clipboard API (doesn't work on HTTP)

---

## API Integration

### Endpoints Used

**1. GET /check_logged_in** (line 26)
- Get current user's username
- Response: `{ username: "user@gmail.com" }`

**2. GET /get_player_id** (line 38)
- Get player's ID in this league
- Query params: `username`, `leagueName`
- Response: `{ player_id: 123 }`

**3. GET /get_league_info** (lines 53, 121)
- Get league details and player standings
- Query param: `leagueName`
- Response: League object with `league_players` array

**4. GET /get_games_by_league** (line 71)
- Get all games in league
- Query param: `leagueName`
- Response: Array of game objects

**CRITICAL**: All requests include `credentials: 'include'`

---

## Related Components

- [GameCard](./game-card.md) - Individual game display
- [LeagueManagerPanel](./league-manager-panel.md) - Commissioner tools
- [User Dashboard](./user-dashboard.md) - League selection

---

## Backend Integration

- [League Info](../../playoff-pickem-backend/docs/league-create.md) - League details endpoint
- [Get Games](../../playoff-pickem-backend/docs/game-create.md) - Games endpoint
- [Leaderboard](../../playoff-pickem-backend/docs/grading-manual.md) - Points calculation

---

## Business Logic

### Why Poll Leaderboard?

**Real-time Updates**: During live games, players' points change as stats update

**User Experience**: Players want to see standings update without refreshing

**Frequency**: Every 30 seconds balances freshness with API load

---

### Why Show Join Code?

**Invite Players**: League Manager needs to share code with friends

**Accessibility**: Displayed prominently with copy button

**Persistence**: Always visible, no need to dig through settings

---

### Why Sort Games by Date?

**Chronological Order**: Shows upcoming games first, then live, then past

**User Expectations**: Natural ordering for sports leagues

**Implementation** (lines 92-96):
```javascript
const sortedGames = gamesData.sort((a, b) => {
  return new Date(a.game_date) - new Date(b.game_date);
});
```

---

*Last Updated: January 2026*
