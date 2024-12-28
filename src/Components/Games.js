import React, { useState } from "react";
import { Link } from "react-router-dom";
import GameFormBuilder from "./GameFormBuilder";

const Games = () => {
  const [Games, setGames] = useState([]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Games</h1>
      <div className="overflow-hidden shadow-lg rounded-lg">
        <table className="min-w-full table-auto text-left">
          <thead>
            <tr className="bg-blue-50 text-gray-600">
              <th className="py-3 px-4 border-b text-sm font-medium">ID</th>
              <th className="py-3 px-4 border-b text-sm font-medium">Name</th>
              <th className="py-3 px-4 border-b text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Games.length > 0 ? (
              Games.map((game) => (
                <tr key={game.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-700">{game.id}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{game.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    <Link
                      to={`/games/${game.id}/edit`}
                      className="text-blue-500 hover:text-blue-700 mr-3"
                    >
                      Edit
                    </Link>
                    <button className="text-red-500 hover:text-red-700">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-3 px-4 text-center text-gray-500">
                  No Games available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Games;
