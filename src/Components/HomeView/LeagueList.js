import React, { useEffect, useState } from "react";
import LeagueCard from "./LeagueCard";
import { FakeLeagueData } from "../DummyData";
import { Link } from "react-router-dom";
import Header from "./Header";
import { getUsername } from "../../App";

const LeagueList = () => {
  const [usersLeagues, setUsersLeagues] = useState([]);
  const username = getUsername();
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    async function getUsersLeagues() {
      try {
        const response = await fetch(`${apiUrl}/get_users_leagues?username=${username}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();  // Parse the response as JSON
          console.log(data);
          setUsersLeagues(data);
        }
        else {
          console.log("Error not with endpoint");
        }
      }
      catch (error) {
        console.log("error with endpoint?");
      }
    }

    getUsersLeagues();
  }, [])

  return (
    <div className="min-h-screen bg-zinc-900 px-4">
      <div className="flex flex-wrap mt-10 p-6 gap-4 justify-center items-center">
        {usersLeagues.map((league, index) => (
          <LeagueCard key={index} league={league} />
        ))}
      </div>
      <div className="flex flex-col space-y-2" style={{alignItems: "center"}}>
        <Link to="/league-create" className="text-white bg-emerald-700 hover:bg-emerald-800 focus:ring-4 focus:ring-emerald-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-emerald-600 dark:emerald:bg-blue-700 focus:outline-none dark:focus:ring-emerald-800 max-w-xs">
          Create League
        </Link>
        <Link to="/league-join" className="text-white bg-emerald-700 hover:bg-emerald-800 focus:ring-4 focus:ring-emerald-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-emerald-600 dark:hover:bg-emerald-700 focus:outline-none dark:focus:ring-emerald-800 max-w-xs">
          Join League
        </Link>
      </div>
      
    </div>
  );
};

export default LeagueList;
