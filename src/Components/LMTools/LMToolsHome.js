import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUsername } from "../../App";
import GameFormBuilder from "../GameFormBuilder";

const LMToolsHome = () => {
    const [isCommissioner, setIsCommissioner] = useState(false);
    const [showModal, setShowModal] = useState(false); // State for modal visibility
    const { leagueName } = useParams();
    const username = getUsername();
    const navigate = useNavigate();

    if (!isCommissioner) {
        navigate(`/league-home/${leagueName}`);
    }

    useEffect(() => {
        let userID = 0;
        fetch(`http://127.0.0.1:5000/get_league_by_name?leagueName=${leagueName}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log(data);
                userID = data.commissioner.user_id;
            })
            .catch((error) => {
                console.error(error);
                alert("Something went wrong");
            });

        fetch(`http://127.0.0.1:5000/get_user_by_username?username=${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log(data);
                if (userID === data.id) {
                    setIsCommissioner(true);
                }
            })
            .catch((error) => {
                console.error(error);
                alert("Something went wrong");
            });
    }, [leagueName, username]);

    const handleDeleteLeague = async () => {
        const data = { leagueName };

        try {
            const response = await fetch("http://127.0.0.1:5000/delete_league", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                alert("League deleted successfully I think?");
                navigate("/league-list");
            } else {
                alert("Something went wrong");
            }
        } catch (error) {
            alert("Endpoint wasn't reached, I think");
        }
    };

    return (
        <div>
            <h1>LM Tools</h1>
            <GameFormBuilder />

            {/* Delete Button */}
            <button
                onClick={() => setShowModal(true)}
                className="bg-red-700 hover:bg-red-900 text-white py-2 px-4 rounded"
            >
                Delete League
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
    );
};

export default LMToolsHome;
