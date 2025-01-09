import react, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUsername } from "../App";

const ViewGameForms = () => {
    const { leagueName } = useParams();
    const username = getUsername();
    const [gameForms, setGameForms] = useState([]);
    const [userChoices, setUserChoices] = useState({});

    const handleWinnerLoserProp = ( prop_id, answer ) => {
        async function saveAnswer() {
            const data = {
                leagueName: leagueName,
                username: username,
                prop_id: prop_id,
                answer: answer
            };

            try {
                const response = await fetch("http://127.0.0.1:5000/answer_winner_loser_prop", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
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

    const handleOverUnderProp = ( prop_id, answer ) => {
        async function saveAnswer() {
            const data = {
                leagueName: leagueName,
                username: username,
                prop_id: prop_id,
                answer: answer
            };

            try {
                const response = await fetch("http://127.0.0.1:5000/answer_over_under_prop", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
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
                const response = await fetch(`http://127.0.0.1:5000/get_games?leagueName=${leagueName}`, {
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

    const handleChoiceChange = (gameId, propId, choiceType, value) => {
        setUserChoices((prevChoices) => ({
            ...prevChoices,
            [gameId]: {
                ...prevChoices[gameId],
                [propId]: {
                    ...prevChoices[gameId]?.[propId],
                    [choiceType]: value, // Store the selected choice (either team or over/under)
                },
            },
        }));
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
                                            onChange={() => handleChoiceChange(game.id, prop.id, 'team', prop.favorite_team)}
                                            checked={userChoices[game.id]?.[prop.id]?.team === prop.favorite_team}
                                        />
                                        {prop.favorite_team}
                                    </label>
                                </div>
                                <div>
                                    <label>
                                        <input
                                            type="radio"
                                            name={`game_${game.id}_winner_${index}`}
                                            value={prop.underdog_team}
                                            onChange={() => handleChoiceChange(game.id, prop.id, 'team', prop.underdog_team)}
                                            checked={userChoices[game.id]?.[prop.id]?.team === prop.underdog_team}
                                        />
                                        {prop.underdog_team}
                                    </label>
                                </div>
                                {console.log(prop.prop_id)}
                                <button onClick={() => handleWinnerLoserProp(prop.prop_id, userChoices[game.id]?.[prop.id]?.team)}>
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
                                            onChange={() => handleChoiceChange(game.id, prop.id, 'choice', 'over')}
                                            checked={userChoices[game.id]?.[prop.id]?.choice === 'over'}
                                        />
                                        Over
                                    </label>
                                </div>
                                <div>
                                    <label>
                                        <input
                                            type="radio"
                                            name={`game_${game.id}_over_under_${index}`}
                                            value="under"
                                            onChange={() => handleChoiceChange(game.id, prop.id, 'choice', 'under')}
                                            checked={userChoices[game.id]?.[prop.id]?.choice === 'under'}
                                        />
                                        Under
                                    </label>
                                </div>

                                <button onClick={() => handleOverUnderProp(prop.prop_id, userChoices[game.id]?.[prop.id]?.choice)}>
                                    Save Answer
                                </button>
                            </div>
                        ))}
                    </div>
                ))
            ) : (
                <p>No games available</p>
            )}
        </div>
    );
}

export default ViewGameForms;