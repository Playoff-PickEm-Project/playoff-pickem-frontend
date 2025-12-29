import "./App.css";
import { useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import LoginPage from "./Components/Auth/LoginPage";
import RegisterPage from "./Components/Auth/Register";
import Header from "./Components/HomeView/Header";

import LeagueList from "./Components/HomeView/LeagueList";
import LeagueHome from "./Components/LeagueHome";
import CreateLeague from "./Components/LeagueCreation/LeagueCreation";
import JoinLeague from "./Components/LeagueCreation/LeagueJoin";
import GradeGameForm from "./Components/GradeGameForm";
import LMToolsHome from "./Components/LMTools/LMToolsHome";
import GamePage from "./Components/HomeView/GamePage";
import GameList from "./Components/HomeView/GameList";
import EditGameForm from "./Components/EditGameForm";

import LandingPage from "./Components/Landing/LandingPage";

export const getUsername = () => {
  return localStorage.getItem("username");
};

export default function App() {
  const [authorized, setAuthorized] = useState(() => {
    const storedAuth = localStorage.getItem("authorized");
    return storedAuth === "true";
  });

  const handleLoginSuccess = () => {
    setAuthorized(true);
    localStorage.setItem("authorized", "true");
  };

  return (
    <div className="App">
      {/* Only show Header inside the authenticated app */}
      {authorized && <Header authorized={authorized} setAuthorized={setAuthorized} />}

      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth pages */}
        <Route
          path="/login"
          element={
            authorized ? (
              <Navigate to="/league-list" replace />
            ) : (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            )
          }
        />
        <Route
          path="/register"
          element={authorized ? <Navigate to="/league-list" replace /> : <RegisterPage />}
        />

        {/* Authorized pages */}
        <Route path="/league-list" element={authorized ? <LeagueList /> : <Navigate to="/login" replace />} />

        <Route path="/league-create" element={authorized ? <CreateLeague /> : <Navigate to="/login" replace />} />
        <Route path="/league-join" element={authorized ? <JoinLeague /> : <Navigate to="/login" replace />} />

        <Route
          path="/league-home/:leagueName"
          element={authorized ? <LeagueHome /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/league-home/:leagueName/viewGames"
          element={authorized ? <GameList /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/league-home/:leagueName/viewGames/:gameId"
          element={authorized ? <GamePage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/league-home/:leagueName/setCorrectAnswers/:gameId"
          element={authorized ? <GradeGameForm /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/league-home/:leagueName/editGame/:gameId"
          element={authorized ? <EditGameForm /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/league-home/:leagueName/league_manager_tools"
          element={authorized ? <LMToolsHome /> : <Navigate to="/login" replace />}
        />

        {/* Optional: catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
