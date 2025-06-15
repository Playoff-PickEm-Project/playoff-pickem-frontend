import React from "react";

const User = ({ data }) => {
  return (
    <div
      id="user"
      className="w-1/2 bg-zinc-700 shadow-md rounded p-4 flex flex-col gap-2"
    >
      {data.map((player, index) => (
        <div
          key={index}
          className="flex justify-between items-center text-lg font-medium"
        >
          {/* Rank and Username Section */}
          <div className="flex items-center">
            {/* Incrementing rank with each iteration */}
            <span className="mr-4 text-white">{index + 1}.</span>
            <h3 className="text-white">{player.name}</h3>
          </div>
          {/* Score Section */}
          <div>
            <p className="text-emerald-500 font-semibold">{player.points}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default User;
