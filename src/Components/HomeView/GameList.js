import React, { useEffect, useState } from "react";
import GameCard from "./GameCard";
import { FakeLeagueData } from "../DummyData";
import { Link } from "react-router-dom";
import Header from "./Header";
import { getUsername } from "../../App";
import { useNavigate, useParams } from "react-router-dom";

const GameList = () => {
  const [leaguesGames, setLeaguesGames] = useState([]);
  const { leagueName } = useParams();
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    async function getGamesFromLeague() {
      try {
        const response = await fetch(`${apiUrl}/get_games?leagueName=${leagueName}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();  // Parse the response as JSON
          console.log(data);
          setLeaguesGames(data);
        }
        else {
          console.log("Error not with endpoint");
        }
      }
      catch (error) {
        console.log("error with endpoint?");
      }
    }

    getGamesFromLeague();
  }, [])
  console.log(leagueName);

  return (
    <div>
      <div className="flex flex-wrap mt-10 p-6 gap-4">
        {leaguesGames.map((game, index) => (
          <GameCard key={index} league_name={leagueName} game={game} />
        ))}
      </div>      
    </div>
  );
};

export default GameList;