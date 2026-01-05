import react, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUsername } from "../App";

const ViewGameForms = () => {
    const { leagueName } = useParams();
    const username = getUsername();
    const [gameForms, setGameForms] = useState([]);
    const [userChoices, setUserChoices] = useState({});
    const [winnerLoserAnswers, setWinnerLoserAnswers] = useState({});
    const [overUnderAnswers, setOverUnderAnswers] = useState({})
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;

    const [isCommissioner, setIsCommissioner] = useState(false);

    useEffect(() => {
        let userID = 0;
        fetch(`${apiUrl}/get_league_by_name?leagueName=${leagueName}`, {
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

        fetch(`${apiUrl}/get_user_by_username?username=${encodeURIComponent(username)}`, {
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

    useEffect(() => {
        function getWinnerLoserAnswers() {
            fetch(`${apiUrl}/retrieve_winner_loser_answers?leagueName=${encodeURIComponent(leagueName)}&username=${encodeURIComponent(username)}`, {
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
                setWinnerLoserAnswers(data); // Use the parsed JSON data
                console.log(data);
            }).catch((error) => {
                console.error(error); // Log the error
                alert("Something went wrong");
            });
        }    

        function getOverUnderAnswers() {
            fetch(`${apiUrl}/retrieve_over_under_answers?leagueName=${encodeURIComponent(leagueName)}&username=${encodeURIComponent(username)}`, {
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
                setOverUnderAnswers(data); // Use the parsed JSON data
            }).catch((error) => {
                console.error(error); // Log the error
                alert("Something went wrong");
            });
        }

        getWinnerLoserAnswers();

        getOverUnderAnswers();
    }, [])

    useEffect(() => {
        if (Object.keys(winnerLoserAnswers).length > 0 || Object.keys(overUnderAnswers).length > 0) {
            const updatedChoices = {};
    
            // Populate winner/loser answers
            for (const [propId, team] of Object.entries(winnerLoserAnswers)) {
                updatedChoices[propId] = { team }; // Save the team choice for each propId
            }
    
            // Populate over/under answers
            for (const [propId, choice] of Object.entries(overUnderAnswers)) {
                updatedChoices[propId] = { ...updatedChoices[propId], choice }; // Save the over/under choice
            }
    
            console.log("Updated Choices:", updatedChoices);
            setUserChoices(updatedChoices);
        }
    }, [winnerLoserAnswers, overUnderAnswers]);
    
    // NEED TO UPDATE SO THAT CANNOT ANSWER IF DATE HAS PASSED
    const handleWinnerLoserProp = (prop_id, answer) => {
        async function saveAnswer() {
            const data = {
                leagueName: leagueName,
                username: username,
                prop_id: prop_id,
                answer: answer
            };

            try {
                const response = await fetch(`${apiUrl}/answer_winner_loser_prop`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    alert("Answer saved successfully");
                }
                else {
                    alert("Answer was not saved");
                }
            }
            catch (error) {
                console.log("Endpoint was not reached");
            }
        }

        saveAnswer();
    }

    const handleOverUnderProp = (prop_id, answer) => {
        async function saveAnswer() {
            const data = {
                leagueName: leagueName,
                username: username,
                prop_id: prop_id,
                answer: answer
            };

            try {
                const response = await fetch(`${apiUrl}/answer_over_under_prop`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    alert("Answer saved successfully");
                }
                else {
                    alert("Answer was not saved");
                }
            }
            catch (error) {
                console.log("Endpoint was not reached");
            }
        }

        saveAnswer();
    }

    useEffect(() => {
        console.log(userChoices)
        async function viewGames() {
            try {
                const response = await fetch(`${apiUrl}/get_games?leagueName=${leagueName}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

                if (response.ok) {
                    const data = await response.json();
                    setGameForms(data);
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
    }, [userChoices])

    // Need to retrieve users saved answers.
    const handleChoiceChange = (propId, key, value) => {
        setUserChoices((prev) => ({
            ...prev,
            [propId]: {
                ...prev[propId],
                [key]: value,
            },
        }));
    };

    const handleNavigation = (gameId) => {
        navigate(`/league-home/${leagueName}/setCorrectAnswers/${gameId}`);
    };

    return (
        <div style={{ padding: '20px' }}>
            {gameForms.length > 0 ? (
                gameForms.map((game) => (
                    <div key={game.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', marginBottom: '20px', backgroundColor: '#f9f9f9', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>{game.game_name}</h3>
                        <p style={{ fontSize: '16px', color: '#555', marginBottom: '12px' }}>
                            Game Start Time: {new Date(game.start_time).toLocaleString()}
                        </p>

                        {/* Assuming game has winner_loser_props */}
                        {game.winner_loser_props && game.winner_loser_props.map((prop, index) => (
                            <div key={index} style={{ marginBottom: '16px' }}>
                                <h4 style={{ fontSize: '18px' }}>{prop.question}</h4>
                                <div>
                                    <label>
                                        <input
                                            type="radio"
                                            name={`game_${game.id}_winner_${index}`}
                                            value={prop.favorite_team}
                                            onChange={() => handleChoiceChange(prop.prop_id, 'team', prop.favorite_team)}
                                            checked={userChoices[prop.prop_id]?.team === prop.favorite_team}
                                        />
                                        {prop.favorite_team} ({prop.favorite_points})
                                    </label>
                                </div>
                                <div>
                                    <label>
                                        <input
                                            type="radio"
                                            name={`game_${game.id}_winner_${index}`}
                                            value={prop.underdog_team}
                                            onChange={() => handleChoiceChange(prop.prop_id, 'team', prop.underdog_team)}
                                            checked={userChoices[prop.prop_id]?.team === prop.underdog_team}
                                        />
                                        {prop.underdog_team} ({prop.underdog_points})
                                    </label>
                                </div>
                                {console.log(prop.prop_id)}
                                <button onClick={() => handleWinnerLoserProp(prop.prop_id, userChoices[prop.prop_id]?.team)}>
                                    Save Answer
                                </button>
                            </div>
                        ))}

                        {/* Assuming game has over_under_props */}
                        {game.over_under_props && game.over_under_props.map((prop, index) => (
                            <div key={index} style={{ marginBottom: '16px' }}>
                                <h4 style={{ fontSize: '18px' }}>{prop.question}</h4>
                                <div>
                                    <label>
                                        <input
                                            type="radio"
                                            name={`game_${game.id}_over_under_${index}`}
                                            value="over"
                                            onChange={() => handleChoiceChange(prop.prop_id, 'choice', 'over')}
                                            checked={userChoices[prop.prop_id]?.choice === 'over'}
                                        />
                                        Over ({prop.over_points})
                                    </label>
                                </div>
                                <div>
                                    <label>
                                        <input
                                            type="radio"
                                            name={`game_${game.id}_over_under_${index}`}
                                            value="under"
                                            onChange={() => handleChoiceChange(prop.prop_id, 'choice', 'under')}
                                            checked={userChoices[prop.prop_id]?.choice === 'under'}
                                        />
                                        Under ({prop.under_points})
                                    </label>
                                </div>

                                <button onClick={() => handleOverUnderProp(prop.prop_id, userChoices[prop.prop_id]?.choice)}>
                                    Save Answer
                                </button>
                            </div>
                        ))}
                        {isCommissioner && <button onClick={() => handleNavigation(game.id)} class="bg-green-600 hover:bg-green-700">
                            Set Answers
                        </button>}
                    </div>
                ))
            ) : (
                <p>No games available</p>
            )}
        </div>
    );
}

export default ViewGameForms;