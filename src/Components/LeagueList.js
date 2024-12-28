import React from "react";
import LeagueCard from "./LeagueCard";
import { FakeLeagueData } from "./DummyData";

const LeagueList = () => {
  return (
    <div className="flex flex-wrap mt-10 p-6 gap-4">
      {FakeLeagueData.map((league, index) => (
        <LeagueCard key={index} league={league} />
      ))}
    </div>
  );
};

export default LeagueList;
