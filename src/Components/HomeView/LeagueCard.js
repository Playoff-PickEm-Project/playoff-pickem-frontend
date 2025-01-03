import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation

const LeagueCard = ({ league }) => {
  return (
    <div className="p-4 max-w-sm">
      <div className="flex rounded-lg h-full dark:bg-gray-800 bg-teal-400 p-8 flex-col">
        <div className="flex items-center mb-3">
          <h2 className="text-white dark:text-white text-lg font-medium">{league.league_name}</h2>
        </div>
        <div className="flex flex-col justify-between flex-grow">
          <p className="leading-relaxed text-base text-white dark:text-gray-300">
            Members: 
            {league.league_players.map((player, index) => (
               <li key={index}>{player.name}</li>
            ))}
          </p>
          <p className="leading-relaxed text-base text-white dark:text-gray-300">
            Join Code: <span className="font-semibold">{league.join_code}</span>
          </p>
          {/* Use Link component for navigation with league name */}
          <Link
            to={`/league-home/${league.league_name}`}  // Pass the league's name to the path
            className="mt-3 text-black dark:text-white hover:text-blue-600 inline-flex items-center"
          >
            View League
            <svg
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="w-4 h-4 ml-2"
              viewBox="0 0 24 24"
            >
              <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LeagueCard;
