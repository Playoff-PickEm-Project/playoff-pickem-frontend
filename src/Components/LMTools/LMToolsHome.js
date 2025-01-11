import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUsername } from "../../App";
import GameFormBuilder from "../GameFormBuilder";

const LMToolsHome = () => {
    const [isCommissioner, setIsCommissioner] = useState(false);
    const [showModal, setShowModal] = useState(false); // State for modal visibility
    const { leagueName } = useParams();
    const [league, setLeague] = useState({});
    const username = getUsername();
    const navigate = useNavigate();
    const [userID, setUserID] = useState(null);
    const [showDeletePlayerModal, setDeletePlayerModal] = useState(false);
    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch league data
                const leagueResponse = await fetch(`${apiUrl}/get_league_by_name?leagueName=${leagueName}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
    
                if (!leagueResponse.ok) {
                    throw new Error(`HTTP error! status: ${leagueResponse.status}`);
                }
    
                const leagueData = await leagueResponse.json();
                setLeague(leagueData);
                setUserID(leagueData.commissioner.user_id);
    
                // Fetch user data and compare to check if they are the commissioner
                const userResponse = await fetch(`${apiUrl}/get_user_by_username?username=${username}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
    
                if (!userResponse.ok) {
                    throw new Error(`HTTP error! status: ${userResponse.status}`);
                }
    
                const userData = await userResponse.json();
    
                // Check if user is the commissioner
                if (leagueData.commissioner.user_id === userData.id) {
                    setIsCommissioner(true);
                } else {
                    // If not the commissioner, navigate away
                    navigate(`/league-home/${leagueName}`);
                }
            } catch (error) {
                console.error(error); // Log the error
                alert("Something went wrong");
            }
        };
    
        fetchData();
    }, [leagueName, username, navigate]);

    const handleDeleteLeague = () => {
        async function deleteLeague() {
            const data = { leagueName };

            try {
                const response = await fetch(`${apiUrl}/delete_league`, {
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

    const handleDeletePlayer = ( playername ) => {
        async function deletePlayer() {
            const data = {
                leaguename: leagueName,
                playerName: playername
            };

            try {
                const response = await fetch(`${apiUrl}/delete_player`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                })

                if (response.ok) {
                    alert("Player deleted successfully.");
                    navigate(`/league-home/${leagueName}/league_manager_tools`);
                }
                else {
                    alert("something went wrong");
                }
            }
            catch (error) {
                console.log(error);
            }
        }

        deletePlayer();
    }

    return(
        <div>
            <h1>LM Tools</h1>
            <GameFormBuilder />

            <div className="bg-white p-6 rounded-md shadow-md">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">League Players</h2>
                <ul className="divide-y divide-gray-200">
                {league.league_players &&
                    Array.isArray(league.league_players) &&
                    league.league_players.map((player) => (
                        <li key={player.id} className="flex justify-between items-center py-4">
                        <div>
                            <p className="text-lg font-medium text-gray-700">{player.name}</p>
                        </div>
                        {player.id !== league.commissioner_id && (
                            <button
                            onClick={() => setDeletePlayerModal(player)} // Open modal with player data
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none"
                            >
                                Delete Player
                            </button>
                        )}
                        </li>
                    ))}
                </ul>

                {/* Centralized Modal */}
                {showDeletePlayerModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
                            <p className="mb-4">
                                Are you sure you want to delete <strong>{showDeletePlayerModal.name}</strong> from the league?
                            </p>
                            <div className="flex justify-end">
                            <button
                                onClick={() => setDeletePlayerModal(null)} // Close the modal
                                className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                setDeletePlayerModal(null); // Close the modal
                                handleDeletePlayer(showDeletePlayerModal.name); // Delete the player
                                }}
                                className="bg-red-700 hover:bg-red-900 text-white py-2 px-4 rounded"
                            >
                                Delete
                            </button>
                            </div>
                        </div>
                    </div>
                )}

                

            <button style={{margin: "20px"}} onClick={() => setShowModal(true)} className='bg-red-700 hover:bg-red-900'>
                Delete league
            </button>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
                        <p className="mb-4">Are you sure you want to delete this league?</p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    handleDeleteLeague();
                                }}
                                className="bg-red-700 hover:bg-red-900 text-white py-2 px-4 rounded"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default LMToolsHome;
