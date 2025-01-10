import React, { useEffect, useState } from "react";
import User from "./User";
import { FakeData } from "./DummyData";
import { getUsername } from "../App";
import { useParams } from "react-router-dom";

// Leaderboard component, displayed at the top of the home page
const Leaderboard = () => {
  const [playerStandings, setPlayerStandings] = useState([])
  const { leagueName } = useParams();

  useEffect(() => {
    async function getPlayerStandings() {
      try {
        const response = await fetch(`http://127.0.0.1:5000/get_player_standings?leagueName=${leagueName}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json();
          data.league_players.sort((a, b) => b.points - a.points); // Sort in descending order (highest points first)
          setPlayerStandings(data.league_players); // Set the sorted data
          console.log(data.league_players);
        }
        else {
          alert("something went wrong");
        }
      }
      catch (error) {
        alert("endpoint wasnt reached i think");
      }
    }

    getPlayerStandings();
  }, [])

  return (
    <div className="leaderboard flex flex-col items-center">
      <h1 className="text-3xl font-bold text-center mb-4">Leaderboard</h1>
      <User data={playerStandings} />
    </div>
  );
};

export default Leaderboard;
