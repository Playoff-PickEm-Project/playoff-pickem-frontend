import React, { useEffect, useState } from "react";
import LeagueCard from "./LeagueCard";
import { FakeLeagueData } from "../DummyData";
import { Link } from "react-router-dom";
import Header from "./Header";
import { getUsername } from "../../App";

const LeagueList = () => {
  const [usersLeagues, setUsersLeagues] = useState([]);
  const username = getUsername();

  useEffect(() => {
    async function getUsersLeagues() {
      try {
        const response = await fetch(`http://127.0.0.1:5000/get_users_leagues?username=${username}`, {
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
    <div>
      <div className="flex flex-wrap mt-10 p-6 gap-4 justify-center items-center">
        {usersLeagues.map((league, index) => (
          <LeagueCard key={index} league={league} />
        ))}
      </div>
      <div className="flex flex-col space-y-2" style={{alignItems: "center"}}>
        <Link to="/league-create" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 max-w-xs">
          Create League
        </Link>
        <Link to="/league-join" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 max-w-xs">
          Join League
        </Link>
      </div>
      
    </div>
  );
};

export default LeagueList;
