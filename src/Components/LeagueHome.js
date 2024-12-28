import React from 'react';
import { useParams } from 'react-router-dom';  // Import useParams to get the leagueName from the URL
import Leaderboard from './Leaderboard';
import Games from './Games';
import GameFormBuilder from './GameFormBuilder';

const LeagueHome = () => {
  const { leagueName } = useParams();  // Access the leagueName from the URL parameters

  return (
    <div>
        <h1>Welcome to {leagueName}</h1>
        <Leaderboard />
        <Games />
        <GameFormBuilder />
    </div>
  );
};

export default LeagueHome;
