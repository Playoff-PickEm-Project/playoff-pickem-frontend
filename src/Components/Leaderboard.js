import React from "react";
import User from "./User";
import { FakeData } from "./DummyData";

// Leaderboard component, displayed at the top of the home page
const Leaderboard = () => {
  return (
    <div className="leaderboard flex flex-col items-center">
      <h1 className="text-3xl font-bold text-center mb-4">Leaderboard</h1>
      <User data={FakeData} />
    </div>
  );
};

export default Leaderboard;
