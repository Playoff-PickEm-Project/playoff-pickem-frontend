# Playoff Pickem Frontend Documentation

## Overview

This documentation provides comprehensive guides for all frontend components, pages, and workflows in the Playoff Pickem React application.

## Architecture

The frontend is built with React and follows a component-based architecture:

```
React App (SPA)
    ↓
React Router (Navigation)
    ↓
Page Components (Routes)
    ↓
Feature Components (UI)
    ↓
API Calls (fetch to backend)
```

### Technology Stack

- **Framework**: React 18
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Native Fetch API
- **State Management**: React Hooks (useState, useEffect, useContext)

### Project Structure

```
src/
├── Components/
│   ├── Auth/              # Authentication pages
│   ├── HomeView/          # Main app views
│   │   └── Game/          # Game-specific components
│   ├── LeagueDashboard/   # League overview components
│   ├── Landing/           # Landing page components
│   └── [Other Components] # Forms, modals, etc.
├── App.js                 # Main app component with routing
├── config.js              # API URL configuration
└── index.js               # App entry point
```

## Component Documentation

### Authentication & User Management
- [Login Flow](./login-flow.md) - Google OAuth authentication
- [User Dashboard](./user-dashboard.md) - League selection and management

### League Management
- [Create League](./league-create-ui.md) - League creation form
- [Join League](./league-join-ui.md) - Join via code
- [League Home](./league-home.md) - Dashboard overview and leaderboard

### Game Management
- [Game Form Builder](./game-form-builder.md) - Create game with props
- [Edit Game Form](./edit-game-form.md) - Modify existing games
- [Game Card](./game-card.md) - Game display component
- [Game Page](./game-page.md) - Individual game view

### Prop Selection (NEW FEATURE)
- [Prop Selection Modal](./prop-selection-modal.md) - Player prop selection UI
- [Prop Selection Flow](./prop-selection-flow.md) - Complete user journey

### Grading
- [Grade Game Form](./grade-game-form.md) - Commissioner grading interface

## Routing Structure

**File**: `App.js`

```
/ (root)
  → LandingPage

/login
  → LoginPage (redirects to backend OAuth)

/user-home
  → User (displays user's leagues)

/league-home/:leagueName
  → LeagueHome (league dashboard)

/league-home/:leagueName/league_manager_tools
  → LeagueManagerPanel (create/edit games)

/league-home/:leagueName/game/:gameId
  → GamePage (view and answer props)

/league-home/:leagueName/create-game
  → GameFormBuilder (create new game)

/league-home/:leagueName/edit-game/:gameId
  → EditGameForm (edit existing game)

/league-home/:leagueName/grade-game/:gameId
  → GradeGameForm (grade game)
```

## API Integration

### Configuration

**File**: `config.js`

```javascript
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

**Environment Variables**:
- `REACT_APP_API_URL`: Backend API base URL

### Fetch Pattern

All API calls follow this pattern:

```javascript
const response = await fetch(`${API_URL}/endpoint`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',  // REQUIRED for session auth
  body: JSON.stringify(data)
});

if (response.ok) {
  const data = await response.json();
  // Handle success
} else {
  const error = await response.json();
  // Handle error
}
```

**CRITICAL**: Always include `credentials: 'include'` for authenticated requests

## State Management

### Local State (useState)

Used for component-specific state:
- Form inputs
- Modal visibility
- Loading states
- Error messages

### URL Parameters (useParams)

Used for routing context:
- `leagueName`: Current league
- `gameId`: Current game
- `username`: Logged-in user

### Session Storage

Used for persistent data:
- User authentication state
- Selected league context

## Styling Approach

### Tailwind CSS

**Utility-first CSS framework**

Common patterns:
```jsx
// Layout
<div className="flex justify-between items-center">

// Spacing
<div className="p-4 m-2 space-y-4">

// Colors
<button className="bg-blue-500 hover:bg-blue-600 text-white">

// Responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

### Custom Styles

Minimal custom CSS, mostly Tailwind utilities

## Key Features

### 1. Prop Selection Modal

**Component**: `PropSelectionModal.js`

**Location**: `src/Components/HomeView/Game/PropSelectionModal.js`

**Features**:
- Separates mandatory and optional props
- Shows selection count vs. limit
- Disables submit until correct number selected
- Real-time validation

**Trigger**: Click on upcoming game card

---

### 2. Game Status Badges

**Visual Indicators**:
- 🔵 **Upcoming**: Game hasn't started, can answer
- 🟢 **Live**: Game in progress, locked
- 🔴 **Completed**: Game finished, graded

**Implementation**: `GameStatusBar.js`

---

### 3. Real-time Updates

**Polling Strategy**:
- Frontend polls backend every 30 seconds
- Updates scores, stats, and game status
- Uses `setInterval` in `useEffect`

**Components**:
- `GamePage.js`: Polls game details
- `LeagueHome.js`: Polls leaderboard

---

### 4. Responsive Design

**Breakpoints** (Tailwind):
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

**Mobile-first approach**: Default styles for mobile, add breakpoint classes for larger screens

---

## Component Patterns

### 1. Data Fetching on Mount

```javascript
useEffect(() => {
  const fetchData = async () => {
    const response = await fetch(`${API_URL}/endpoint`, {
      credentials: 'include'
    });
    const data = await response.json();
    setState(data);
  };

  fetchData();
}, []); // Empty deps = run once on mount
```

### 2. Form Submission

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(`${API_URL}/endpoint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      navigate('/success-page');
    } else {
      const error = await response.json();
      alert(error.description);
    }
  } catch (e) {
    alert('Network error');
  }
};
```

### 3. Conditional Rendering

```javascript
return (
  <div>
    {loading && <Spinner />}
    {error && <ErrorMessage message={error} />}
    {data && <DataDisplay data={data} />}
  </div>
);
```

### 4. List Rendering

```javascript
return (
  <div>
    {items.map((item) => (
      <ItemCard key={item.id} item={item} />
    ))}
  </div>
);
```

---

## Error Handling

### API Error Handling

**Pattern**:
```javascript
try {
  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.description || 'Request failed');
  }

  return await response.json();
} catch (e) {
  console.error('Error:', e);
  alert(e.message || 'An error occurred');
}
```

### Common Errors

1. **CORS Issues**: Missing `credentials: 'include'`
2. **404 Errors**: Incorrect API endpoint
3. **401 Errors**: Not logged in or session expired
4. **Network Errors**: Backend not running

---

## Performance Optimization

### 1. Lazy Loading (TODO)

Not currently implemented, but recommended for:
- Image components
- Large forms
- Route-based code splitting

### 2. Debouncing

Used in search inputs to reduce API calls

### 3. Memoization

Minimal use currently, could optimize:
- Expensive calculations
- Filtered/sorted lists

---

## Development Tips

### Running the App

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### Environment Setup

Create `.env` file:
```
REACT_APP_API_URL=http://localhost:5000
```

### Debugging

**React DevTools**: Browser extension for inspecting component state

**Console Logging**: Check browser console for errors

**Network Tab**: Inspect API requests/responses

---

## Testing

### Manual Testing Checklist

1. **Authentication**:
   - Login via Google
   - Session persists on refresh
   - Logout clears session

2. **League Operations**:
   - Create league
   - Join league with code
   - View leaderboard

3. **Game Operations**:
   - Create game with props
   - Edit game before start
   - Answer props
   - Select props (new feature)

4. **Grading**:
   - Set correct answers
   - Grade game
   - View updated standings

---

## Common Issues

### 1. "Failed to fetch"

**Causes**:
- Backend not running
- CORS misconfiguration
- Wrong API URL

**Solution**: Check `config.js` and backend CORS settings

---

### 2. Session not persisting

**Cause**: Missing `credentials: 'include'`

**Solution**: Add to all authenticated fetch calls

---

### 3. Props not updating

**Cause**: Not re-fetching after state change

**Solution**: Add fetch call in success handler

---

## Deployment

### Build Command

```bash
npm run build
```

Creates optimized production build in `build/` directory

### Environment Variables

Set in hosting platform:
- `REACT_APP_API_URL`: Production backend URL

### Hosting Platforms

- **Render**: Used for current deployment
- **Vercel**: Alternative option
- **Netlify**: Alternative option

---

## Related Documentation

- [Backend API Docs](../../playoff-pickem-backend/docs/README.md)
- [Prop Selection Backend](../../playoff-pickem-backend/docs/prop-selection.md)
- [Grading Logic](../../playoff-pickem-backend/docs/grading-manual.md)

---

*Last Updated: January 2026*
