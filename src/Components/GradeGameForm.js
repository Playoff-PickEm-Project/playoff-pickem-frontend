import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const GradeGameForm = () => {
    const { leaguename } = useParams();
    const { gameId } = useParams();
    const [overUnderProps, setOverUnderProps] = useState([]);
    const [winnerLoserProps, setWinnerLoserProps] = useState([]);
    const [userChoices, setUserChoices] = useState({});

    const handleSetCorrectAnswers = ( event ) => {
        event.preventDefault();

        async function setCorrectAnswers() {
            // WANT A FOR LOOP TO ITERATE THROUGH EACH 
            // Loop through each winnerLoserProp
            for (const prop of winnerLoserProps) {
                const data = {
                    leagueName: leaguename,
                    prop_id: prop.prop_id, // Use prop's actual ID from winnerLoserProps
                    answer: userChoices[prop.prop_id]?.team, // Answer would be the selected team
                };

                try {
                    // Send the data to your API
                    const response = await fetch('http://127.0.0.1:5000/set_correct_winner_loser_prop', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data),
                    });

                    if (!response.ok) {
                        alert("went wrong");
                    }

                    const result = await response.json();
                    console.log(result); // Handle the result if needed
                } catch (error) {
                    console.error('Error saving answer:', error);
                    alert('Failed to save answer.');
                }
            }

            // Loop through each overUnderProp
            for (const prop of overUnderProps) {
                const data = {
                    leagueName: leaguename,
                    prop_id: prop.prop_id, // Use prop's actual ID from winnerLoserProps
                    answer: userChoices[prop.prop_id]?.choice, // Answer would be the selected team
                };

                try {
                    // Send the data to your API
                    const response = await fetch('http://127.0.0.1:5000/set_correct_over_under_prop', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data),
                    });

                    if (!response.ok) {
                        alert("went wrong");
                    }

                    const result = await response.json();
                    console.log(result); // Handle the result if needed
                } catch (error) {
                    console.error('Error saving answer:', error);
                    alert('Failed to save answer.');
                }
            }
        }

        setCorrectAnswers();
    }

    useEffect(() => {
        fetch(`http://127.0.0.1:5000/get_game_by_id?game_id=${gameId}`, {
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
            setOverUnderProps(data.over_under_props);
            setWinnerLoserProps(data.winner_loser_props);
        }).catch((error) => {
            console.error(error); // Log the error
            alert("Something went wrong");
        });
    }, [])

    const handleGradeAnswers = ( event ) => {
        event.preventDefault();

        async function gradeAnswers() {
            const data = {
                game_id: gameId
            };

            try {
                const response = await fetch("http://127.0.0.1:5000/grade_game", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });
                
                if (!response.ok) {
                    alert("went wrong");
                }
                console.log("success?");
            }
            catch (error) {
                alert("endpoint not reached");
            }
        }

        gradeAnswers();
    }

    const handleChoiceChange = (propId, type, value) => {
        setUserChoices((prev) => ({
            ...prev,
            [propId]: {
                ...prev[propId],
                [type]: value,
            },
        }));
    };

    return (
        <div>
            <h1>Grade the Game!</h1>

            {/* Render Winner Loser Props */}
            {winnerLoserProps && winnerLoserProps.map((prop, index) => (
                <div key={index} style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '18px' }}>{prop.question}</h4>
                    <div>
                        <label>
                            <input
                                type="radio"
                                name={`winner_${index}`}
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
                                name={`winner_${index}`}
                                value={prop.underdog_team}
                                onChange={() => handleChoiceChange(prop.prop_id, 'team', prop.underdog_team)}
                                checked={userChoices[prop.prop_id]?.team === prop.underdog_team}
                            />
                            {prop.underdog_team} ({prop.underdog_points})
                        </label>
                    </div>
                    {/* <button onClick={() => handleSetCorrectAnswers(prop.prop_id, userChoices[prop.prop_id]?.team)}>
                        Save Answer
                    </button> */}
                </div>
            ))}

            {/* Render Over Under Props */}
            {overUnderProps && overUnderProps.map((prop, index) => (
                <div key={index} style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '18px' }}>{prop.question}</h4>
                    <div>
                        <label>
                            <input
                                type="radio"
                                name={`over_under_${index}`}
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
                                name={`over_under_${index}`}
                                value="under"
                                onChange={() => handleChoiceChange(prop.prop_id, 'choice', 'under')}
                                checked={userChoices[prop.prop_id]?.choice === 'under'}
                            />
                            Under ({prop.under_points})
                        </label>
                    </div>
                    {/* <button onClick={() => handleSetCorrectAnswers(prop.prop_id, userChoices[prop.prop_id]?.choice)}>
                        Save Answer
                    </button> */}
                </div>
            ))}

            <button onClick={handleSetCorrectAnswers}>
                Set correct answers
            </button>

            <button onClick={handleGradeAnswers}>
                Calculate scores
            </button>
        </div>
    )
}

export default GradeGameForm;