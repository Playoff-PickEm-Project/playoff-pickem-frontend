import react, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ViewGameForms = () => {
    const { leagueName } = useParams();
    const [gameForms, setGameForms] = useState([]);

    useEffect(() => {
        async function viewGames() {
            try {
                const response = await fetch(`http://127.0.0.1:5000/get_games?leagueName=${leagueName}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                }
                else {
                    alert("something went wrong");
                }
            }
            catch (error) {
                alert("endpoint wasnt reached i think");
            }
        }
        viewGames();
    }, [])

    return (
        <div>
            hi
        </div>
    )
}

export default ViewGameForms;