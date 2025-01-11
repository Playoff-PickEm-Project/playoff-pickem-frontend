import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getUsername } from '../App';

const GradeGameForm = () => {
    const { leagueName } = useParams();
    const { gameId } = useParams();
    const [overUnderProps, setOverUnderProps] = useState([]);
    const [winnerLoserProps, setWinnerLoserProps] = useState([]);
    const [userChoices, setUserChoices] = useState({});
    const [isCommissioner, setIsCommissioner] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState([]);
    const navigate = useNavigate();
    const username = getUsername();
    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchLeagueAndUser = async () => {
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
                const userID = leagueData.commissioner.user_id;

                // Fetch user data
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

                // Compare user IDs
                if (userID !== userData.id) {
                    navigate(`/league-home/${leagueName}`);
                }
            } catch (error) {
                console.error(error);
                alert("Something went wrong");
            }
        };

        fetchLeagueAndUser();
    }, [leagueName, username, navigate]);

    console.log(userChoices)

    const handleSetCorrectAnswers = async (event) => {
        event.preventDefault();

        // async function setCorrectAnswers() {
        //     // WANT A FOR LOOP TO ITERATE THROUGH EACH 
        //     // Loop through each winnerLoserProp
        //     for (const prop of winnerLoserProps) {
        //         let set_answer = "";
        //         if (userChoices[prop.prop_id]) {
        //             set_answer = userChoices[prop.prop_id]?.team;
        //         }
        //         else {
        //             set_answer = correctAnswers[prop.prop_id]
        //         }

        //         const data = {
        //             leagueName: leagueName,
        //             prop_id: prop.prop_id, // Use prop's actual ID from winnerLoserProps
        //             answer: set_answer, // Answer would be the selected team
        //         };

        //         try {
        //             // Send the data to your API
        //             const response = await fetch('http://127.0.0.1:5000/set_correct_winner_loser_prop', {
        //                 method: 'POST',
        //                 headers: {
        //                     'Content-Type': 'application/json',
        //                 },
        //                 body: JSON.stringify(data),
        //             });

        //             if (!response.ok) {
        //                 alert("went wrong");
        //             }

        //             const result = await response.json();
        //             console.log(result); // Handle the result if needed
        //         } catch (error) {
        //             console.error('Error saving answer:', error);
        //             alert('Failed to save answer.');
        //         }
        //     }

        //     // Loop through each overUnderProp
        //     for (const prop of overUnderProps) {
        //         let set_answer = "";
        //         if (userChoices[prop.prop_id] && userChoices[prop.prop_id].choice) {
        //             set_answer = userChoices[prop.prop_id]?.choice;
        //         }
        //         else {
        //             set_answer = correctAnswers[prop.prop_id]
        //         }
        //         console.log(set_answer)

        //         const data = {
        //             leagueName: leagueName,
        //             prop_id: prop.prop_id, // Use prop's actual ID from winnerLoserProps
        //             answer: set_answer, // Answer would be the selected team
        //         };

        //         try {
        //             // Send the data to your API
        //             const response = await fetch('http://127.0.0.1:5000/set_correct_over_under_prop', {
        //                 method: 'POST',
        //                 headers: {
        //                     'Content-Type': 'application/json',
        //                 },
        //                 body: JSON.stringify(data),
        //             });

        //             if (!response.ok) {
        //                 alert("went wrong");
        //             }

        //             const result = await response.json();
        //             console.log(result); // Handle the result if needed
        //         } catch (error) {
        //             console.error('Error saving answer:', error);
        //             alert('Failed to save answer.');
        //         }
        //     }
        // }
        async function gradeAnswers() {
            const data = {
                game_id: gameId
            };

            try {
                const response = await fetch(`${apiUrl}/grade_game`, {
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

        // await setCorrectAnswers();
        await gradeAnswers();
    }

    console.log(userChoices)

    useEffect(() => {
        fetch(`${apiUrl}/get_game_by_id?game_id=${gameId}`, {
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

    useEffect(() => {
        async function getSavedAnswers() {
            try {
                const response = await fetch(`${apiUrl}/get_correct_prop_answers?game_id=${gameId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

                if (!response.ok) {
                    console.log("something went wrong")
                }

                const data = await response.json();
                const answersMap = data.reduce((acc, { prop_id, correct_answer }) => {
                    acc[prop_id] = correct_answer;
                    return acc;
                }, {});
                setCorrectAnswers(answersMap)
                console.log(data)
            }
            catch (error) {
                console.log(error);
            }
        }

        getSavedAnswers();
    }, [])

    const handleChoiceChange = (propId, type, value) => {
        setUserChoices((prev) => ({
            ...prev,
            [propId]: {
                ...prev[propId],
                [type]: value,
            },
        }));
    };

    const handleWinnerLoserProp = (prop_id, answer) => {
        const data = {
            prop_id: prop_id,
            answer: answer
        };

        fetch(`${apiUrl}/correct_winner_loser_prop`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (response.ok) {
                    // Update userChoices immediately after saving
                    setUserChoices(prevChoices => ({
                        ...prevChoices,
                        [prop_id]: { 'team': answer }
                    }));
                } else {
                    alert("Answer was not saved");
                }
            })
            .catch(error => console.log("Error saving answer"));
    };

    const handleOverUnderProp = (prop_id, answer) => {
        console.log(prop_id)
        const data = {
            prop_id: prop_id,
            answer: answer
        };

        fetch(`${apiUrl}/correct_over_under_prop`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (response.ok) {
                    // Update userChoices immediately after saving
                    setUserChoices(prevChoices => ({
                        ...prevChoices,
                        [prop_id]: { choice: answer }
                    }));
                } else {
                    alert("Answer was not saved");
                }
            })
            .catch(error => console.log("Error saving answer"));
    };

    return (
        <div>
            <h1>Grade the Game!</h1>

            {/* Render Winner Loser Props */}
            {winnerLoserProps && winnerLoserProps.map((prop, index) => (
                <div key={prop.prop_id} style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '18px' }} className='font-bold'>{prop.question}</h4>
                    <div>
                        <label>
                            <input
                                type="radio"
                                name={`winner_${prop.prop_id}`}
                                value={prop.favorite_team}
                                onChange={() => handleWinnerLoserProp(prop.prop_id, prop.favorite_team)}
                                checked={userChoices[prop.prop_id]?.team === prop.favorite_team || (!userChoices[prop.prop_id] && correctAnswers[prop.prop_id] === prop.favorite_team)}
                            />
                            {prop.favorite_team} ({prop.favorite_points})
                        </label>
                    </div>
                    <div>
                        <label>
                            <input
                                type="radio"
                                name={`winner_${prop.prop_id}`}
                                value={prop.underdog_team}
                                onChange={() => handleWinnerLoserProp(prop.prop_id, prop.underdog_team)}
                                checked={userChoices[prop.prop_id]?.team === prop.underdog_team || (!userChoices[prop.prop_id] && correctAnswers[prop.prop_id] === prop.underdog_team)}
                            />
                            {prop.underdog_team} ({prop.underdog_points})
                        </label>
                    </div>
                </div>
            ))}

            {/* Render Over Under Props */}
            {overUnderProps && overUnderProps.map((prop, index) => (
                <div key={prop.prop_id} style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '18px' }} className='font-bold'>{prop.question}</h4>
                    <div>
                        <label>
                            <input
                                type="radio"
                                name={`over_under_${prop.prop_id}`}
                                value="over"
                                onChange={() => handleOverUnderProp(prop.prop_id, 'over')}
                                checked={userChoices[prop.prop_id]?.choice === 'over' || (!userChoices[prop.prop_id] && correctAnswers[prop.prop_id] === 'over')}
                            />
                            Over ({prop.over_points})
                        </label>
                    </div>
                    <div>
                        <label>
                            <input
                                type="radio"
                                name={`over_under_${prop.prop_id}`}
                                value="under"
                                onChange={() => handleOverUnderProp(prop.prop_id, 'under')}
                                checked={userChoices[prop.prop_id]?.choice === 'under' || (!userChoices[prop.prop_id] && correctAnswers[prop.prop_id] === 'under')}
                            />
                            Under ({prop.under_points})
                        </label>
                    </div>
                </div>
            ))}

            <button onClick={handleSetCorrectAnswers}>
                Grade Answers
            </button>
        </div>
    )
}

export default GradeGameForm;
