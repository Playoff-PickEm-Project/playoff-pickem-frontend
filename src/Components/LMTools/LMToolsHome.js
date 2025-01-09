import react, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUsername } from "../../App";
import GameFormBuilder from "../GameFormBuilder";

const LMToolsHome = () => {
    const [isCommissioner, setIsCommissioner] = useState(false);
    const { leagueName } = useParams();
    const username = getUsername();
    const navigate = useNavigate();

    if (!isCommissioner) {
        navigate(`/league-home/${leagueName}`)
    }

    useEffect(() => {
        let userID = 0;
        fetch(`http://127.0.0.1:5000/get_league_by_name?leagueName=${leagueName}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        }).then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // Parse the JSON body
        }).then((data) => {
            console.log(data);
            userID = data.commissioner.user_id;
        }).catch((error) => {
            console.error(error); // Log the error
            alert("Something went wrong");
        });

        fetch(`http://127.0.0.1:5000/get_user_by_username?username=${username}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        }).then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // Parse the JSON body
        }).then((data) => {
            console.log(data);
            if (userID = data.id) {
            setIsCommissioner(true);
            }
        }).catch((error) => {
            console.error(error); // Log the error
            alert("Something went wrong");
        });
    }, [])

    const handleDeleteLeague = ( event ) => {
        event.preventDefault();
    
        async function deleteLeague() {
        const data = {
            leagueName: leagueName
        };
    
        try {
            const response = await fetch("http://127.0.0.1:5000/delete_league", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
            })
    
            if (response.ok) {
            alert("League deleted successfully I think?");
            navigate("/league-list");
            }
            else {
            alert("something went wrong");
            }
        }
        catch (error) {
            alert("endpoint wasnt reached i think");
        }
        }
    
        deleteLeague();
    }

    return(
        <div>
            <h1>LM Tools</h1>
            <GameFormBuilder />

            <button onClick={handleDeleteLeague} className='bg-red-700 hover:bg-red-900'>
                Delete league
            </button>
        </div>
    );
}

export default LMToolsHome;