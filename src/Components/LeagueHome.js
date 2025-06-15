import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';  // Import useParams to get the leagueName from the URL
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Leaderboard from './Leaderboard';
import Games from './Games';
import GameFormBuilder from './GameFormBuilder';
import LMToolsHome from './LMTools/LMToolsHome';
import { getUsername } from '../App';

const LeagueHome = () => {
  const { leagueName } = useParams();  // Access the leagueName from the URL parameters
  const navigate = useNavigate();
  const username = getUsername();
  const [isCommissioner, setIsCommissioner] = useState(false);
  const [league, setLeague] = useState({});
  const [userID, setUserID] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchData = async () => {
        try {
            // Fetch league data
            const leagueResponse = await fetch(`${apiUrl}/get_league_by_name?leagueName=${leagueName}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!leagueResponse.ok) {
                throw new Error(`HTTP error! status: ${leagueResponse.status}`);
            }

            const leagueData = await leagueResponse.json();
            setLeague(leagueData);
            setUserID(leagueData.commissioner.user_id);

            // Fetch user data and compare to check if they are the commissioner
            const userResponse = await fetch(`${apiUrl}/get_user_by_username?username=${username}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!userResponse.ok) {
                throw new Error(`HTTP error! status: ${userResponse.status}`);
            }

            const userData = await userResponse.json();

            // Check if user is the commissioner
            if (leagueData.commissioner.user_id === userData.id) {
                setIsCommissioner(true);
            } else {
                // If not the commissioner, navigate away
                
            }
        } catch (error) {
            console.error(error); // Log the error
            alert("Something went wrong");
        }
    };

    fetchData();
}, [leagueName, username, navigate]);

  const handleNavigateLM = () => {
    navigate(`/league-home/${leagueName}/league_manager_tools`);
  };

  return (
    <div className="min-h-screen bg-zinc-900 px-4 py-6">
        <h1 className="text-white" style={{marginTop: "10px"}}>Welcome to {leagueName}</h1>
        <Leaderboard />
    </div>
  );
};

export default LeagueHome;
