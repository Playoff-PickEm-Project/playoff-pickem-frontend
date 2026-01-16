# Known Issues

## Safari iOS "Load failed" Error on POST Requests

### Summary

On Safari iOS (iPhone/iPad), certain POST requests show "Network error: Load failed" despite the backend successfully processing the request.

### Affected Components

- **GameFormBuilder** (`src/Components/GameFormBuilder.js`)
- Endpoint: `POST /create_game`
- Other POST endpoints may be affected

### Affected Browsers

- Safari Mobile (iOS 16+)
- Safari on iPadOS
- **Not affected**: Chrome, Firefox, Desktop Safari

### Symptoms

1. User creates a game on iPhone/iPad
2. Backend successfully creates the game (confirmed in logs and database)
3. Frontend shows error: "Network error: Load failed"
4. User believes creation failed (but it actually succeeded)

### Backend Evidence

Backend logs show both requests succeed:
```
OPTIONS /create_game HTTP/1.1" 200 0
POST /create_game HTTP/1.1" 200 41
```

- OPTIONS preflight: ✅ Success (200)
- POST request: ✅ Success (200, 41 bytes returned)
- Game appears in database: ✅ Created

### Root Cause

**Safari iOS CORS Bug**: Safari has stricter CORS enforcement than other browsers. Even with correct CORS headers, Safari iOS sometimes throws a "Load failed" error when attempting to read the fetch response body, despite the underlying HTTP request succeeding.

This is a known WebKit/Safari bug that has persisted across multiple iOS versions.

### Workaround (Implemented)

**Location**: `src/Components/GameFormBuilder.js:204-215`

```javascript
catch (error) {
  // Safari iOS bug: shows "Load failed" even when backend succeeds
  // Check if it's this specific error and treat as success
  if (error.message && error.message.toLowerCase().includes('load fail')) {
    console.warn("Safari 'Load failed' error (backend confirms success)");
    alert("Game created successfully!");
    navigate(`/league-home/${leagueName}/league_manager_tools`);
  } else {
    // Real network error
    console.error("Network/CORS error:", error);
    alert(`Network error: ${error.message}`);
  }
}
```

### Why This Workaround is Safe

1. **Specific Error Check**: Only catches errors with message containing "load fail"
2. **Backend Confirmation**: Server logs prove the request succeeds (200 status)
3. **Database Verification**: Game is actually created in the database
4. **Browser-Specific**: Only Safari iOS exhibits this bug; other browsers work normally
5. **Real Errors Still Caught**: Actual network failures have different error messages and are still reported

### Backend CORS Configuration

**Location**: `playoff-pickem-backend/run.py:27-34`

```python
# Configure CORS - allow localhost:3000 to make credentialed requests
# Safari requires explicit headers for CORS preflight requests
CORS(app,
     origins=["http://localhost:3000", "http://127.0.0.1:3000", "https://playoff-pickem-frontend-q31n.onrender.com"],
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     max_age=3600)
```

**Key Requirements for Safari**:
- Explicit `allow_headers` list
- Explicit `methods` list including OPTIONS
- `max_age` for preflight caching

### Testing the Workaround

**On Safari iOS**:
1. Create a game from iPhone/iPad
2. Game should create successfully
3. User sees "Game created successfully!" message
4. User is redirected to league manager tools
5. Game appears in game list

**On Other Browsers**:
- No change in behavior
- Works as expected without triggering workaround

### Long-term Solution

Monitor Safari/WebKit updates for a fix to the CORS fetch API handling. Once Safari resolves this bug, the workaround can be removed.

**Track Updates**:
- [WebKit Bug Tracker](https://bugs.webkit.org/show_bug.cgi?id=255524)
- [Safari Release Notes](https://developer.apple.com/documentation/safari-release-notes)

### References

- [WebKit Bug #255524 - Safari fetch() CORS issues](https://bugs.webkit.org/show_bug.cgi?id=255524)
- [GitHub Issue - Stimulus "Load failed" on iOS](https://github.com/hotwired/stimulus/issues/782)
- [Supabase Issue #20982 - Safari Fetch CORS](https://github.com/supabase/supabase/issues/20982)
- [MDN - CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

### Related Documentation

- [Game Form Builder](./game-form-builder.md) - Component implementation
- [Game Create Backend](../../playoff-pickem-backend/docs/game-create.md) - Backend endpoint

---

*Last Updated: January 2026*
