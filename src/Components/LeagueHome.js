import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';  // Import useParams to get the leagueName from the URL
import Leaderboard from './Leaderboard';
import Games from './Games';
import GameFormBuilder from './GameFormBuilder';

const LeagueHome = () => {
  const { leagueName } = useParams();  // Access the leagueName from the URL parameters
  const navigate = useNavigate()

  const handleDeleteLeague = ( event ) => {
    event.preventDefault();

    async function deleteLeague() {
      const data = {
        leagueName: leagueName
      };

      try {
        const response = await fetch("http://127.0.0.1:5000/delete_league", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        })

        if (response.ok) {
          alert("League deleted successfully I think?");
          navigate("/league-list");
        }
        else {
          alert("something went wrong");
        }
      }
      catch (error) {
        alert("endpoint wasnt reached i think");
      }
    }

    deleteLeague();
  }

  return (
    <div>
        <h1>Welcome to {leagueName}</h1>
        <Leaderboard />
        <Games />
        <GameFormBuilder />

        <Link to={`/league-home/${leagueName}/viewGames`} className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'>
          View Games
        </Link>

        <button onClick={handleDeleteLeague} className='bg-red-700 hover:bg-red-900'>
          Delete league
        </button>
    </div>
  );
};

export default LeagueHome;
