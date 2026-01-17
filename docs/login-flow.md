# Login Flow Documentation

## Overview

The application uses Google OAuth 2.0 for authentication. Users sign in with their Google account, and the backend creates a session-based authentication system using Flask sessions.

## Architecture

```
Frontend → Backend /login → Google OAuth → Backend Callback → Session Created → Redirect to User Home
```

---

## Components Involved

### 1. LandingPage

**File**: `src/Components/Landing/LandingPage.js`

**Purpose**: Entry point for unauthenticated users

**Login Button** (lines 28-40):
```javascript
<button onClick={handleLogin}>
  Sign in with Google
</button>
```

**handleLogin()** (lines 15-17):
```javascript
const handleLogin = () => {
  window.location.href = `${apiUrl}/login`;
};
```

**Behavior**: Redirects browser to backend `/login` endpoint

---

### 2. Backend OAuth Flow

**Endpoint**: `GET /login`

**File**: `app/controllers/authController.py:9-16`

**Purpose**: Redirect to Google OAuth consent screen

**Flow**:
1. User clicks "Sign in with Google"
2. Browser redirects to `http://backend/login`
3. Backend redirects to Google OAuth
4. User authorizes app
5. Google redirects to `http://backend/auth/callback`
6. Backend creates session
7. Backend redirects to `http://frontend/user-home`

---

### 3. LoginPage Component

**File**: `src/Components/Auth/LoginPage.js`

**Route**: `/login`

**Purpose**: Loading screen during OAuth flow

**Display** (lines 6-12):
```javascript
return (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <h1 className="text-2xl font-bold">Logging you in...</h1>
      <p className="text-gray-600 mt-2">Redirecting to Google...</p>
    </div>
  </div>
);
```

**Note**: This component is rarely shown (OAuth is fast), but provides feedback if loading takes time

---

### 4. User Home Redirect

**Backend Callback**: `GET /auth/callback`

**File**: `app/controllers/authController.py:18-60`

**Final Redirect** (line 52):
```javascript
return redirect('http://frontend/user-home')
```

**Frontend Route**: `/user-home`

**Component**: `User.js`

**Purpose**: Display user's leagues after successful login

---

## Session Management

### Backend Session

**Technology**: Flask-Session with server-side storage

**Session Data** (authController.py:44-47):
```python
session['user'] = {
    'email': user_info['email'],
    'name': user_info.get('name', user_info['email'])
}
```

**Cookie**: HTTP-only session cookie sent to browser

**Lifetime**: Persistent until logout or server restart

---

### Frontend Session Verification

**Checking Login Status**:

Most components check login status on mount:

**Pattern** (example from User.js:25-44):
```javascript
useEffect(() => {
  const checkLogin = async () => {
    const response = await fetch(`${apiUrl}/check_logged_in`, {
      credentials: 'include'  // CRITICAL
    });

    if (response.ok) {
      const data = await response.json();
      setUsername(data.username);
    } else {
      navigate('/login');
    }
  };

  checkLogin();
}, []);
```

**Endpoint**: `GET /check_logged_in`

**Response** (200):
```json
{
  "logged_in": true,
  "username": "user@gmail.com"
}
```

**Response** (401):
```json
{
  "logged_in": false
}
```

---

## Protected Routes

**Pattern**: All authenticated pages check login status in useEffect

**Components with Auth Check**:
- User.js (user home)
- LeagueHome.js (league dashboard)
- GamePage.js (game view)
- GameFormBuilder.js (create game)
- EditGameForm.js (edit game)
- GradeGameForm.js (grade game)

**Redirect Logic**: If not logged in, navigate to `/login`

---

## Logout Flow

**Endpoint**: `POST /logout`

**File**: `app/controllers/usersController.py:97-108`

**Purpose**: Clear server session and log out user

**Backend Action**:
```python
@usersController.route('/logout', methods=['POST'])
def logout():
    username = session.get('username', 'Unknown')
    session.clear()  # Clear entire session
    logging.info(f"User {username} logged out successfully")
    return jsonify({'message': 'Logged out successfully'}), 200
```

**Frontend Implementation** (Header.js:19-41):
```javascript
const handleLogout = async () => {
  try {
    // Call backend to clear session
    await fetch(`${apiUrl}/logout`, {
      method: 'POST',
      credentials: 'include',  // Send session cookie
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Logout request failed:', error);
  }

  // Clear localStorage
  localStorage.setItem("authorized", "false");
  localStorage.removeItem("username");
  localStorage.removeItem("auth_provider");

  // Update state
  setAuthorized(false);

  // Navigate to login
  navigate("/login", { replace: true });
};
```

**Flow**:
1. User clicks logout button in Header
2. Frontend calls `POST /logout` with credentials
3. Backend clears session using `session.clear()`
4. Frontend clears localStorage (username, auth_provider, authorized flag)
5. Frontend updates `authorized` state to `false`
6. Frontend navigates to `/login` (replace history to prevent back button issues)
7. LoginPage's session check (`/session-info`) will now return 401
8. User must log in again to access the app

**Result**: Session fully cleared on both frontend and backend, preventing auto re-login

---

## CORS and Credentials

### Critical Setting

**ALL authenticated API calls must include**:
```javascript
credentials: 'include'
```

**Why**: Sends session cookie with request

**Without it**: Backend can't identify user, returns 401

### CORS Configuration

**Backend** (app/__init__.py:23-30):
```python
CORS(app,
  origins=['http://localhost:3000', 'https://frontend-url.com'],
  supports_credentials=True
)
```

**Why**: Allow cross-origin requests with credentials

---

## User Registration

**First-time Login**:

**Flow** (authController.py:34-42):
1. User logs in with Google
2. Backend checks if User exists (by email)
3. If not exists, create new User record
4. Create session
5. Redirect to user-home

**Database Record** (User model):
```python
User(
  username=email,  # Google email
  profile_picture=picture_url  # Google profile pic
)
```

**No Password**: OAuth handles authentication, no password stored

---

## Common Errors

### 1. "Not logged in" / Redirected to login

**Cause**: Session expired or missing

**Check**:
- `credentials: 'include'` in fetch call
- CORS configured with `supports_credentials=True`
- Session cookie present (browser dev tools → Application → Cookies)

**Fix**: Log in again

---

### 2. Infinite redirect loop

**Cause**: Login check fails even after successful login

**Common Reasons**:
- Missing `credentials: 'include'`
- CORS misconfiguration
- Cookie domain mismatch (localhost vs 127.0.0.1)

**Debug**:
- Check network tab for `/check_logged_in` request
- Verify cookies are being sent

---

### 3. OAuth error "redirect_uri_mismatch"

**Cause**: Google OAuth redirect URI doesn't match registered URI

**Fix**: Update Google Cloud Console OAuth settings to include:
```
http://localhost:5000/auth/callback
https://backend-url.com/auth/callback
```

---

### 4. "Failed to fetch" on login check

**Cause**: Backend not running or wrong URL

**Check**:
- Backend server running
- `apiUrl` in frontend config correct
- Network connectivity

---

## Security Considerations

### Session Security

**HTTP-only Cookies**: Cannot be accessed by JavaScript (prevents XSS)

**Secure Flag**: Enabled in production (HTTPS only)

**SameSite**: Lax or None with Secure (CORS support)

---

### OAuth Security

**State Parameter**: Prevents CSRF attacks (handled by Authlib)

**Scope Limitation**: Only requests email and profile (minimal access)

**No Token Storage**: OAuth tokens not stored, only user info

---

## Environment Variables

### Backend

**Required** (.env):
```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
SECRET_KEY=flask_secret_key_for_sessions
```

### Frontend

**Required** (.env):
```
REACT_APP_API_URL=http://localhost:5000
```

**Production**: Set to actual backend URL

---

## Testing Login Flow

### Manual Test

1. Navigate to `http://localhost:3000`
2. Click "Sign in with Google"
3. Redirected to Google OAuth
4. Authorize application
5. Redirected back to `/user-home`
6. Username displayed, can create/join leagues

### Verify Session

**Browser Dev Tools**:
1. Open Application tab
2. Check Cookies → `http://localhost:5000`
3. Should see `session` cookie
4. Note: HTTP-only flag should be set

---

## Related Documentation

- [User Dashboard](./user-dashboard.md) - Post-login landing page
- [Backend Authentication](../../playoff-pickem-backend/docs/user-authentication.md) - Backend OAuth flow

---

## User Experience Flow

### First-time User

1. Lands on LandingPage
2. Clicks "Sign in with Google"
3. Google consent screen (first time only)
4. Authorizes app
5. Redirected to User Home (empty state)
6. Can create or join league

### Returning User

1. Lands on LandingPage
2. Clicks "Sign in with Google"
3. Google auto-signs in (no consent needed)
4. Redirected to User Home
5. Sees list of joined leagues
6. Clicks league to enter

---

*Last Updated: January 2026*
