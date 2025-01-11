import react, { useState } from "react";
import { getUsername } from "../../App";
import { useNavigate } from "react-router-dom";

const CreateLeague = () => {
    const [leagueName, setLeagueName] = useState("");
    const [playerName, setPlayerName] = useState("");
    const username = getUsername();
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;

    const handleCreateLeague = (event) => {
        event.preventDefault();
    
        async function createLeague() {
          const data = {
            leagueName: leagueName,
            username: username,
            playerName: playerName
          };
    
          try {
            const response = await fetch(`${apiUrl}/create_league`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            });
    
            if (response.ok) {
              alert("League created successfully (I think)?")
              navigate("/league-list")
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

    return(
        <div>
            <h4>League Name</h4>
            <input 
                name="League-Name" 
                placeholder="Input your league name." 
                type="text"
                onChange={(e) => setLeagueName(e.target.value)}
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

            <br />

            {leagueName !== "" && playerName !== "" &&
                <button onClick={handleCreateLeague}>
                    Create League    
                </button>}
        </div>
    )
}

export default CreateLeague;