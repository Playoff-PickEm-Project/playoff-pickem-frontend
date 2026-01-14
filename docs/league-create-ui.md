# Create League UI Documentation

## Overview

The CreateLeague component provides a form for users to create a new league. Upon successful creation, the user becomes the League Manager (commissioner) and receives a unique join code to share with others.

## Component Location

**File**: `src/Components/CreateLeague.js`

**Route**: `/create-league`

**Access**: Clicked from User Dashboard "Create New League" button

---

## Purpose

- Collect league name from user
- Submit league creation request to backend
- Display generated join code
- Redirect to newly created league

---

## State Management

**Local State** (lines 8-11):

```javascript
const [leagueName, setLeagueName] = useState('');
const [username, setUsername] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

**State Purposes**:
- `leagueName`: User input for league name
- `username`: Logged-in user's email
- `loading`: Form submission state
- `error`: Error message if creation fails

---

## Key Functions

### 1. useEffect - Get Username

**Location**: Lines 13-31

**Purpose**: Fetch logged-in username on component mount

**API Call** (line 19):
```javascript
GET /check_logged_in
```

**Response Handling** (lines 23-25):
- Sets username state
- Used in league creation request

**Error Handling** (lines 26-28):
- Logs error to console

**Dependencies**: `[]` (line 30) - Runs once on mount

---

### 2. handleSubmit()

**Location**: Lines 33-79

**Purpose**: Submit league creation request

**Validation** (lines 36-39):
- Check league name not empty
- Alert if empty

**API Call** (lines 41-58):
```javascript
POST /create_league
Body: { leagueName, username }
```

**Success Handling** (lines 60-68):
- Alert with join code: "League created! Join code: ABC123XYZ"
- Navigate to league home page
- Format: `/league-home/${leagueName}`

**Error Handling** (lines 69-75):
- Shows error message from backend
- Sets error state
- Logs to console

**CRITICAL**: Includes `credentials: 'include'` (line 48)

---

## Form UI

**Location**: Lines 82-139

**Container**: Centered card with max width, shadow

**Form Elements**:

**Title** (lines 90-92):
```
Create New League
```

**League Name Input** (lines 94-108):
- Label: "League Name"
- Placeholder: "Enter league name"
- Required field
- Updates leagueName state on change

**Error Display** (lines 110-114):
- Shows error message in red text
- Only visible if error state is set

**Submit Button** (lines 116-132):
- Blue background
- Full width
- Disabled when loading
- Text: "Create League" or "Creating..." (when loading)
- Calls handleSubmit on click

**Cancel Button** (lines 134-137):
- Gray background
- Navigates back to user home
- Text: "Cancel"

---

## Common Errors

### 1. "League name already exists"

**Cause**: Another league with same name exists

**Backend Response**: 400 error with description

**User Action**: Choose different name

**Display**: Error message shown below input (lines 110-114)

---

### 2. "League name cannot be empty"

**Cause**: Submitted form without entering name

**Frontend Validation**: Alert shown (line 38)

**Prevention**: Required attribute on input field

---

### 3. "User does not exist"

**Cause**: Username not found in database or not logged in

**Backend Response**: 404 error

**Debug**: Check `/check_logged_in` returned valid username

---

## API Integration

### Endpoints Used

**1. GET /check_logged_in** (line 19)
- Get current user's username
- Response: `{ username: "user@gmail.com" }`

**2. POST /create_league** (line 41)
- Create new league
- Body: `{ leagueName, username }`
- Response: `{ message, league: { join_code, league_name, ... } }`

**CRITICAL**: All requests include `credentials: 'include'`

---

## Success Flow

1. User enters league name
2. Clicks "Create League"
3. Loading state activates (button shows "Creating...")
4. Backend creates league and Player record
5. Backend returns join code
6. Frontend shows alert with join code
7. User clicks OK on alert
8. Navigates to league home page

**Join Code Alert** (line 64):
```javascript
alert(`League created! Join code: ${data.league.join_code}`);
```

**Important**: User should note join code to share with others

---

## Related Components

- [User Dashboard](./user-dashboard.md) - Links to this page
- [League Home](./league-home.md) - Destination after creation
- [Join League](./league-join-ui.md) - Other players use join code here

---

## Backend Integration

- [Create League](../../playoff-pickem-backend/docs/league-create.md) - Backend workflow
- [Join Code Generation](../../playoff-pickem-backend/docs/league-create.md#join-code-generation) - How codes are created

---

*Last Updated: January 2026*
