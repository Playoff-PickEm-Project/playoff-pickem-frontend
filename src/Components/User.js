import React from "react";

const User = ({ data }) => {
  return (
    <div
      id="user"
      className="w-1/2 bg-white shadow-md rounded p-4 flex flex-col gap-2"
    >
      {data.map((player, index) => (
        <div
          key={index}
          className="flex justify-between items-center text-lg font-medium"
        >
          {/* Rank and Username Section */}
          <div className="flex items-center">
            {/* Incrementing rank with each iteration */}
            <span className="mr-4 text-gray-500">{index + 1}.</span>
            <h3>{player.name}</h3>
          </div>
          {/* Score Section */}
          <div>
            <p className="text-blue-500 font-semibold">{player.points}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default User;
