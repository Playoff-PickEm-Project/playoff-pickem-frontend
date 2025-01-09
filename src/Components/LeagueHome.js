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

  useEffect(() => {
    let userID = 0;
    fetch(`http://127.0.0.1:5000/get_league_by_name?leagueName=${leagueName}`, {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
      },
    }).then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Parse the JSON body
    }).then((data) => {
        console.log(data);
        userID = data.commissioner.user_id;
    }).catch((error) => {
        console.error(error); // Log the error
        alert("Something went wrong");
    });

    fetch(`http://127.0.0.1:5000/get_user_by_username?username=${username}`, {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
      },
    }).then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Parse the JSON body
    }).then((data) => {
        console.log(data);
        if (userID = data.id) {
          setIsCommissioner(true);
        }
    }).catch((error) => {
        console.error(error); // Log the error
        alert("Something went wrong");
    });
  }, [])

  const handleNavigateLM = () => {
    navigate(`/league-home/${leagueName}/league_manager_tools`);
  };

  return (
    <div>
        <h1>Welcome to {leagueName}</h1>
        <Leaderboard />
        <Games />

        <Link to={`/league-home/${leagueName}/viewGames`} className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'>
          View Games
        </Link>

        {isCommissioner && <button onClick={handleNavigateLM}>
          League Manager Tools
        </button>}
    </div>
  );
};

export default LeagueHome;
