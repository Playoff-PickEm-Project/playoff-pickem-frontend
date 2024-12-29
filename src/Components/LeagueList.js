import React from "react";
import LeagueCard from "./LeagueCard";
import { FakeLeagueData } from "./DummyData";

const LeagueList = () => {

  const handleCreateLeague = (event) => {
    event.preventDefault();

    async function createLeague() {
      const data = {
        leagueName: "Test League 1",
        username: "sandhav1",
        playerName: "Player One"
      };

      try {
        const response = await fetch("http://127.0.0.1:5000/create_league", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          alert("League created successfully (I think)?")
        }
        else {
          alert("Something went wrong - id assume league name is taken?")
        }
      }
      catch (error) {
        alert("Something wrong with endpoint?");
      }
    }

    createLeague();
  }

  return (
    <div className="flex flex-wrap mt-10 p-6 gap-4">
      {FakeLeagueData.map((league, index) => (
        <LeagueCard key={index} league={league} />
      ))}

      <button onClick={handleCreateLeague}>
        Create League
      </button>
    </div>
  );
};

export default LeagueList;
