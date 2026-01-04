import react, { use, useEffect, useState } from "react";
import { getUsername } from "../../App";
import { useNavigate } from "react-router-dom";


const JoinLeague = () => {
    const [joinCode, setJoinCode] = useState("");
    const [playerName, setPlayerName] = useState("");
    const username = getUsername();
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;

    const handleJoinLeague = (event) => {
        event.preventDefault();
    
        async function joinLeague() {
          const data = {
            joinCode: joinCode,
            username: username,
            playerName: playerName
          };
    
          try {
            const response = await fetch(`${apiUrl}/join_league`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            });
    
            if (response.ok) {
              alert("League joined successfully (I think)?")
              navigate("/league-list")
            }
            else {
              alert("Join Code is invalid or player name already exists")
            }
          }
          catch (error) {
            alert("Something wrong with endpoint?");
          }
        }
    
        joinLeague();
      }    

    return(
        <div>
            <h4>Join Code</h4>
            <input 
                name="League-Name" 
                placeholder="Input your league's join code." 
                type="text"
                onChange={(e) => setJoinCode(e.target.value)}
                className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <h4>Player Name</h4>
            <input 
                name="Player-Name" 
                placeholder="Input your player name." 
                type="text"
                onChange={(e) => setPlayerName(e.target.value)}
                className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {joinCode !== "" && playerName !== "" &&
                <div className="mt-6">
                    <button
                        onClick={handleJoinLeague}
                        className="py-2 px-6 rounded-lg text-white font-semibold bg-emerald-500 hover:bg-emerald-600 transition duration-200"
                    >
                        Join League
                    </button>
                </div>}
        </div>
        
    )
}

export default JoinLeague;