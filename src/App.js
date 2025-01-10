import './App.css';
import LoginPage from './Components/Auth/LoginPage';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import RegisterPage from './Components/Auth/Register';
import Header from './Components/HomeView/Header';
import Leaderboard from './Components/Leaderboard';
import Games from './Components/Games';
import GameFormBuilder from './Components/GameFormBuilder';
import LeagueList from './Components/HomeView/LeagueList';
import LeagueHome from './Components/LeagueHome';
import CreateLeague from './Components/LeagueCreation/LeagueCreation';
import JoinLeague from './Components/LeagueCreation/LeagueJoin';
import ViewGameForms from './Components/ViewGameForms';
import GradeGameForm from './Components/GradeGameForm';
import LMToolsHome from './Components/LMTools/LMToolsHome';
import GamePage from './Components/HomeView/GamePage';
import GameList from './Components/HomeView/GameList';

export const getUsername = () => {
  return localStorage.getItem('username')
}

export default function App() {
  // Initialize state from local storage
  const [authorized, setAuthorized] = useState(() => {
    const storedAuth = localStorage.getItem('authorized');
    return storedAuth === 'true'; // Convert string to boolean
  });

  // Function to handle login success
  const handleLoginSuccess = () => {
    setAuthorized(true); // Update state to show authorized content
    localStorage.setItem('authorized', 'true'); // Save to local storage
  };

  // Optional: Cleanup local storage if needed
  useEffect(() => {
    return () => {
      localStorage.removeItem('authorized'); // Cleanup on component unmount (optional)
    };
  }, []);

  return (
    <div className="App">
      {/* Need to change to only on leaguelist view */}
      <Header setAuthorized={setAuthorized}/>
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

        {/* To create and join a league */}
        <Route path="/league-create" element={authorized ? <CreateLeague /> : <Navigate to="/" />} />
        <Route path="/league-join" element={authorized ? <JoinLeague /> : <Navigate to="/" />} />
        
        {/* LeagueHome page using leagueName */}
        <Route path="/league-home/:leagueName" element={authorized ? <LeagueHome /> : <Navigate to="/" />} />
        <Route path="/league-home/:leagueName/viewGames" element={authorized ? <GameList /> : <Navigate to="/" />} />
        <Route path="/league-home/:leagueName/viewGames/:gameId" element={authorized ? <GamePage /> : <Navigate to="/" />} />
        <Route path="/league-home/:leagueName/setCorrectAnswers/:gameId" element={authorized ? <GradeGameForm /> : <Navigate to="/" />} />


        <Route path="/league-home/:leagueName/league_manager_tools" element={<LMToolsHome />} />
      </Routes>
    </div>
  );
}