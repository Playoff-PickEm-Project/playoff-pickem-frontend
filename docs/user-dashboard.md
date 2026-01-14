# User Dashboard Documentation

## Overview

The User Dashboard (User.js component) is the main landing page after login. It displays all leagues the user has joined and provides options to create new leagues or join existing ones.

## Component Location

**File**: `src/Components/Auth/User.js`

**Route**: `/user-home`

**Access**: Redirected here after successful Google OAuth login

---

## Purpose

- Display all leagues user has joined
- Provide "Create League" button
- Provide "Join League" button
- Navigate to league dashboard when league clicked
- Show logout button
- Display user's email/username

---

## State Management

**Local State** (lines 9-12):

```javascript
const [username, setUsername] = useState(null);
const [leagues, setLeagues] = useState([]);
const [loading, setLoading] = useState(true);
```

**State Purposes**:
- `username`: Logged-in user's email
- `leagues`: Array of league objects user belongs to
- `loading`: Data fetch state

---

## Key Functions

### 1. useEffect - Authentication and Data Load

**Location**: Lines 14-73

**Purpose**: Verify login and fetch user's leagues

**API Calls** (sequential):

**Step 1**: Check login status (line 20)
```javascript
GET /check_logged_in
```

**Response Handling** (lines 24-39):
- If logged in (200): Set username, proceed to fetch leagues
- If not logged in (non-200): Redirect to login page

**Step 2**: Fetch user's leagues (line 41)
```javascript
GET /get_leagues_by_user?username=${username}
```

**Response Handling** (lines 45-62):
- If successful (200): Parse leagues, set state
- If error: Log to console, show error message

**State Updates** (lines 55-57):
- Sets leagues array
- Sets loading to false

**Error Handling** (lines 63-68):
- Logs error to console
- Sets loading to false

**Dependencies**: `[]` (line 72) - Runs once on mount

---

### 2. handleLeagueClick()

**Location**: Lines 75-77

**Purpose**: Navigate to league dashboard

**Parameters**:
- `leagueName`: Name of clicked league

**Navigation**:
```javascript
navigate(`/league-home/${leagueName}`);
```

**Result**: User enters league home page with games and leaderboard

---

### 3. handleLogout()

**Location**: Lines 87-96

**Purpose**: Log user out and return to landing page

**API Call** (line 89):
```javascript
GET /logout
```

**Success Handling** (line 90):
- Clears session on backend
- Redirects to landing page (`/`)

**CRITICAL**: Includes `credentials: 'include'` (line 89)

---

## UI Display

### League Cards

**Location**: Lines 185-217

**Empty State** (lines 174-183):
- Shown when `leagues.length === 0`
- Message: "You haven't joined any leagues yet."

**League Grid** (lines 185-217):
- Grid layout: 1 column mobile, 2 columns md+, 3 columns lg+
- Click handler navigates to league
- Shows: league name, join code, player count

---

## Common Errors

### 1. Redirected to login page

**Cause**: Not logged in or session expired

**Fix**: Log in again via landing page

---

### 2. Leagues not loading

**Cause**: API call failed

**Check**: Console for errors (line 65)

**Verify**: `credentials: 'include'` in fetch call (line 43)

---

## API Integration

### Endpoints Used

**1. GET /check_logged_in** (line 20)

**2. GET /get_leagues_by_user** (line 41)
- Query param: `username`
- Response: Array of league objects

**3. GET /logout** (line 89)

**CRITICAL**: All requests include `credentials: 'include'`

---

## Related Components

- [Login Flow](./login-flow.md) - How users get here
- [LeagueHome](./league-home.md) - Destination when league clicked

---

## Backend Integration

- [Authentication](../../playoff-pickem-backend/docs/user-authentication.md) - Login verification
- [Get Leagues](../../playoff-pickem-backend/docs/league-create.md) - Fetching user's leagues

---

*Last Updated: January 2026*
