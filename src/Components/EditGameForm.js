import react, { useEffect, useState } from "react";
import { getUsername } from "../App";
import { useNavigate, useParams } from "react-router-dom";

const EditGameForm = () => {
    const [isCommissioner, setIsCommissioner] = useState(false);
    const { leagueName, gameId } = useParams();
    const [league, setLeague] = useState({});
    const [winnerLoserProps, setWinnerLoserProps] = useState([]);
    const [overUnderProps, setOverUnderProps] = useState([]);
    const [editingProps, setEditingProps] = useState({});
    const username = getUsername();
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const leagueResponse = await fetch(`${apiUrl}/get_league_by_name?leagueName=${leagueName}`);
                const leagueData = await leagueResponse.json();
                setLeague(leagueData);

                const userResponse = await fetch(`${apiUrl}/get_user_by_username?username=${encodeURIComponent(username)}`);
                const userData = await userResponse.json();

                if (leagueData.commissioner.user_id === userData.id) {
                    setIsCommissioner(true);
                } else {
                    navigate(`/league-home/${leagueName}`);
                }
            } catch (error) {
                console.error(error);
                alert("Something went wrong");
            }
        };
        fetchData();
    }, [leagueName, username, navigate]);

    useEffect(() => {
        fetch(`${apiUrl}/get_game_by_id?game_id=${gameId}`)
            .then((res) => res.json())
            .then((data) => {
                setWinnerLoserProps(data.winner_loser_props);
                setOverUnderProps(data.over_under_props);
            })
            .catch((err) => console.error(err));
    }, [gameId]);

    const toggleEditing = (propId) => {
        setEditingProps((prev) => ({
            ...prev,
            [propId]: !prev[propId],
        }));
    };

    const handleInputChange = (propId, key, value, type) => {
        if (type === "winnerLoser") {
            setWinnerLoserProps((prev) =>
                prev.map((prop) =>
                    prop.prop_id === propId ? { ...prop, [key]: value } : prop
                )
            );
        } else if (type === "overUnder") {
            setOverUnderProps((prev) =>
                prev.map((prop) =>
                    prop.prop_id === propId ? { ...prop, [key]: value } : prop
                )
            );
        }
    };

    const handleSave = (propId, type) => {
        const endpoint =
            type === "winnerLoser"
                ? `${apiUrl}/update_winner_loser_prop`
                : `${apiUrl}/update_over_under_prop`;
        const propData =
            type === "winnerLoser"
                ? winnerLoserProps.find((prop) => prop.prop_id === propId)
                : overUnderProps.find((prop) => prop.prop_id === propId);
        
        console.log(propData);

        fetch(endpoint, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify(propData),
        })
        .then((res) => {
            if (!res.ok) {
                throw new Error("Failed to save changes");
            }
            toggleEditing(propId);
        })
        .catch((err) => console.error(err));
    };

    const handleDeleteGame = ( event ) => {
        event.preventDefault();

        async function deleteGame() {
            const data = {
                game_id: gameId,
                leaguename: leagueName
            }
            try {
                const response = await fetch(`${apiUrl}/delete_game`, {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data),
                })

                if (!response.ok) {
                    alert("Game could not be deleted. Try again.");
                }
                else {
                    alert("Game was deleted.");
                    navigate(`/league-home/${leagueName}/viewGames`)
                }
            }
            catch (error) {
                alert("Endpoint not reached")
            }
        }

        deleteGame();
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h3 className="text-2xl font-bold mb-4">Edit Game Form</h3>
            {!isCommissioner && (
                <h4 className="text-lg text-red-500">
                    You do not have permission to edit this game
                </h4>
            )}
    
            {isCommissioner && (
                <>
                    {/* Winner-Loser Props */}
                    <h4 className="text-xl font-semibold mt-8 mb-4">Winner-Loser Props</h4>
                    {winnerLoserProps.map((prop) => (
                        <div
                            key={prop.prop_id}
                            className="bg-white shadow-md rounded-lg p-4 mb-6"
                        >
                            {editingProps[prop.prop_id] ? (
                                <div className="space-y-4">
                                    Question
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                                        value={prop.question}
                                        onChange={(e) =>
                                            handleInputChange(
                                                prop.prop_id,
                                                "question",
                                                e.target.value,
                                                "winnerLoser"
                                            )
                                        }
                                        placeholder="Enter question"
                                    />
                                    Favorite Points
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                                        value={prop.favorite_points}
                                        onChange={(e) =>
                                            handleInputChange(
                                                prop.prop_id,
                                                "favorite_points",
                                                e.target.value,
                                                "winnerLoser"
                                            )
                                        }
                                        placeholder="Favorite points"
                                        step={0.5}
                                    />
                                    Underdog Points
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                                        value={prop.underdog_points}
                                        onChange={(e) =>
                                            handleInputChange(
                                                prop.prop_id,
                                                "underdog_points",
                                                e.target.value,
                                                "winnerLoser"
                                            )
                                        }
                                        placeholder="Underdog points"
                                        step={0.5}
                                    />
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleSave(prop.prop_id, "winnerLoser")}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => toggleEditing(prop.prop_id)}
                                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <h5 className="text-lg font-semibold">{prop.question}</h5>
                                    <p className="text-sm">
                                        <span className="font-bold">{prop.favorite_team}:</span> {prop.favorite_points}
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-bold">{prop.underdog_team}:</span> {prop.underdog_points}
                                    </p>
                                    <button
                                        onClick={() => toggleEditing(prop.prop_id)}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                    >
                                        Edit
                                    </button>

                                </div>
                            )}
                        </div>
                    ))}
    
                    {/* Over-Under Props */}
                    <h4 className="text-xl font-semibold mt-8 mb-4">Over-Under Props</h4>
                    {overUnderProps.map((prop) => (
                        <div
                            key={prop.prop_id}
                            className="bg-white shadow-md rounded-lg p-4 mb-6"
                        >
                            {editingProps[prop.prop_id] ? (
                                <div className="space-y-4">
                                    Question
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                                        value={prop.question}
                                        onChange={(e) =>
                                            handleInputChange(
                                                prop.prop_id,
                                                "question",
                                                e.target.value,
                                                "overUnder"
                                            )
                                        }
                                        placeholder="Enter question"
                                    />
                                    Over Points
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                                        value={prop.over_points}
                                        onChange={(e) =>
                                            handleInputChange(
                                                prop.prop_id,
                                                "over_points",
                                                e.target.value,
                                                "overUnder"
                                            )
                                        }
                                        placeholder="Over points"
                                        step={0.5}
                                    />
                                    Under Points
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                                        value={prop.under_points}
                                        onChange={(e) =>
                                            handleInputChange(
                                                prop.prop_id,
                                                "under_points",
                                                e.target.value,
                                                "overUnder"
                                            )
                                        }
                                        placeholder="Under points"
                                        step={0.5}
                                    />
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleSave(prop.prop_id, "overUnder")}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => toggleEditing(prop.prop_id)}
                                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <h5 className="text-lg font-semibold">{prop.question}</h5>
                                    <p className="text-sm">
                                        <span className="font-bold">Over:</span> {prop.over_points}
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-bold">Under:</span> {prop.under_points}
                                    </p>
                                    <button
                                        onClick={() => toggleEditing(prop.prop_id)}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </>
            )}

            <button className="bg-red-600 hover:bg-red-700" onClick={handleDeleteGame}>
                Delete Game
            </button>
        </div>
    );
};

export default EditGameForm;