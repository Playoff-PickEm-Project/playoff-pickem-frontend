import './App.css';
import LoginPage from './Components/Auth/LoginPage';
import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import RegisterPage from './Components/Auth/Register';
import Header from './Components/Header';
import Leaderboard from './Components/Leaderboard';
import Games from './Components/Games';
import GameFormBuilder from './Components/GameFormBuilder';
import LeagueList from './Components/LeagueList';
import LeagueHome from './Components/LeagueHome';

function App() {
  const [authorized, setAuthorized] = useState(false);

  // Function to handle login success
  const handleLoginSuccess = () => {
    setAuthorized(true);  // Update state to show authorized content
  };

  return (
    <div className="App">
      <Header />
      <Routes>
        {/* Render LoginPage or RegisterPage if not logged in */}
        {!authorized ? (
          <>
            <Route path="/" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/register" element={<RegisterPage />} />
          </>
        ) : (
          // Redirect to leaderboard or other authorized pages if logged in
          <Route path="/" element={<Navigate to="/league-list" replace />} />
        )}

        {/* Authorized pages */}
        <Route path="/league-list" element={authorized ? <LeagueList /> : <Navigate to="/" />} />
        
        {/* LeagueHome page using leagueName */}
        <Route path="/league-home/:leagueName" element={authorized ? <LeagueHome /> : <Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
