import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getUsername } from '../App';

const GradeGameForm = () => {
    const { leagueName } = useParams();
    const { gameId } = useParams();
    const [overUnderProps, setOverUnderProps] = useState([]);
    const [winnerLoserProps, setWinnerLoserProps] = useState([]);
    const [variableOptionProps, setVariableOptionProps] = useState([]);
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

        async function setCorrectAnswers() {
            // WANT A FOR LOOP TO ITERATE THROUGH EACH 
            // Loop through each winnerLoserProp
            for (const prop of winnerLoserProps) {
                let set_answer = "";
                if (userChoices[prop.prop_id] != null) {
                    set_answer = userChoices[prop.prop_id]?.team;
                }
                else {
                    set_answer = correctAnswers[prop.prop_id][0]
                }

                const data = {
                    leagueName: leagueName,
                    prop_id: prop.prop_id, // Use prop's actual ID from winnerLoserProps
                    answer: set_answer, // Answer would be the selected team
                };

                try {
                    // Send the data to your API
                    const response = await fetch(`${apiUrl}/set_correct_winner_loser_prop`, {
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
                let set_answer = "";
                if (userChoices[prop.prop_id] && userChoices[prop.prop_id].choice) {
                    set_answer = userChoices[prop.prop_id]?.choice;
                }
                else {
                    set_answer = correctAnswers[prop.prop_id][0]
                }
                console.log(set_answer)

                const data = {
                    leagueName: leagueName,
                    prop_id: prop.prop_id, // Use prop's actual ID from winnerLoserProps
                    answer: set_answer, // Answer would be the selected team
                };

                try {
                    // Send the data to your API
                    const response = await fetch(`${apiUrl}/set_correct_over_under_prop`, {
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

            for (const prop of variableOptionProps) {
                let selectedAnswersForProp = [];

                // Check if user has any choices for this prop
                const userChoice = userChoices[prop.prop_id];

                // If user has choices, loop through and collect selected answers
                if (userChoice && userChoice.choices) {
                    // Assuming userChoice.choices is an array of answers (e.g., ['over', 'under'])
                    selectedAnswersForProp = [...userChoice.choices];
                }

								console.log("After step 2: ", selectedAnswersForProp)

                // Now loop through the options to ensure we add the correct answers (if necessary)
                prop.options.forEach((option) => {
                    // If the correct answer matches one of the options and it's not already in the array, add it
                    if (correctAnswers[prop.prop_id] === option.answer_choice && !selectedAnswersForProp.includes(option.answer_choice)) {
                        selectedAnswersForProp.push(option.answer_choice);
                    }
                });

                console.log("Selected answers for prop_id", prop.prop_id, ":", selectedAnswersForProp);

                // Set the answer(s) for the prop
                const data = {
                    leagueName: leagueName,
                    prop_id: prop.prop_id, // Prop's actual ID
                    answers: selectedAnswersForProp, // Array of selected answers
                };

                try {
                    // Send the data to your API for this prop_id
                    const response = await fetch(`${apiUrl}/set_correct_variable_option_prop`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data),
                    });

                    if (!response.ok) {
                        alert("Something went wrong while saving answer for prop_id: " + prop.prop_id);
                    }

                    const result = await response.json();
                    console.log(result); // Handle the result if needed
                } catch (error) {
                    console.error('Error saving answer for prop_id:', prop.prop_id, error);
                    alert('Failed to save answer for prop_id: ' + prop.prop_id);
                }
            }
        }

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

        await setCorrectAnswers();
        await gradeAnswers();
        alert("Game should be successfully graded.")
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
            setVariableOptionProps(data.variable_option_props);
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
                    // If the current prop_id doesn't exist yet in acc, initialize it as an empty array
                    if (!acc[prop_id]) {
                        acc[prop_id] = [];
                    }

                    // Add the current correct_answer to the array for that prop_id
                    acc[prop_id].push(correct_answer);

                    return acc;
                }, {});

                setCorrectAnswers(answersMap);
                console.log(answersMap);
            }
            catch (error) {
                console.log(error);
            }
        }

        getSavedAnswers();
    }, [])

		useEffect(() => {
			const initChoicesFromCorrect = () => {
					const newChoices = {};
	
					for (const prop of variableOptionProps) {
							const correct = correctAnswers[prop.prop_id];
							if (correct) {
									newChoices[prop.prop_id] = {
											choices: Array.isArray(correct) ? correct : [correct]
									};
							}
					}
	
					setUserChoices((prev) => ({
							...newChoices,  // overrides only if not already set
							...prev
					}));
			};
	
			if (variableOptionProps.length && Object.keys(userChoices).length === 0) {
					initChoicesFromCorrect();
			}
	}, [variableOptionProps, correctAnswers]);

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

    const handleMultipleChoiceChange = (propId, answerChoice, isChecked) => {
        setUserChoices((prevChoices) => {
            const currentChoices = prevChoices[propId]?.choices || [];

            const updatedChoices = isChecked
                ? [...currentChoices, answerChoice]
                : currentChoices.filter((choice) => choice !== answerChoice);

            return {
                ...prevChoices,
                [propId]: {
                    ...prevChoices[propId],
                    choices: updatedChoices,
                },
            };
        });
    };

    return (
        <div className='text-white'>
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
                                onChange={() => handleChoiceChange(prop.prop_id, 'team', prop.favorite_team)}
                                checked={
                                    (userChoices[prop.prop_id]?.team?.includes(prop.favorite_team)) || 
                                    (!userChoices[prop.prop_id] && correctAnswers[prop.prop_id]?.includes(prop.favorite_team))
                                }
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
                                onChange={() => handleChoiceChange(prop.prop_id, 'team', prop.underdog_team)}
                                checked={
                                    (userChoices[prop.prop_id]?.team?.includes(prop.underdog_team)) || 
                                    (!userChoices[prop.prop_id] && correctAnswers[prop.prop_id]?.includes(prop.underdog_team))
                                }
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
                                onChange={() => handleChoiceChange(prop.prop_id, 'choice', 'over')}
                                checked={
                                    (userChoices[prop.prop_id]?.choice?.includes('over')) || 
                                    (!userChoices[prop.prop_id] && correctAnswers[prop.prop_id]?.includes('over'))
                                }
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
                                onChange={() => handleChoiceChange(prop.prop_id, 'choice', 'under')}
                                checked={
                                    (userChoices[prop.prop_id]?.choice?.includes('under')) || 
                                    (!userChoices[prop.prop_id] && correctAnswers[prop.prop_id]?.includes('under'))
                                }
                            />
                            Under ({prop.under_points})
                        </label>
                    </div>
                </div>
            ))}

            {/* Render Variable Option Props */}
            {variableOptionProps && variableOptionProps.map((prop) => {
                // Normalize the correct answers for this prop
                const correctAnswersForProp = Array.isArray(correctAnswers[prop.prop_id])
                    ? correctAnswers[prop.prop_id]  // Multiple correct answers
                    : [correctAnswers[prop.prop_id]]; // Single correct answer (make it an array)

                // Handle checkbox change for multiple choices
                const handleCheckboxChange = (e, option) => {
                    const isChecked = e.target.checked;

                    // Update user choices
                    handleMultipleChoiceChange(
                        prop.prop_id,
                        option.answer_choice,
                        isChecked
                    );
                };

                return (
                    <div key={prop.prop_id} style={{ marginBottom: '16px' }}>
                        <h4 style={{ fontSize: '18px' }} className="font-bold">{prop.question}</h4>
                        <div>
                            {prop.options && prop.options.map((option) => {
                                // Check if this option is correct
                                const isCorrectAnswer = correctAnswersForProp.includes(option.answer_choice);

                                // Check if the option is selected by the user
                                const isSelectedByUser = userChoices[prop.prop_id]?.choices?.includes(option.answer_choice);

                                // The checkbox is checked if it's selected by the user or if it's a correct answer
                                // const isChecked = isSelectedByUser || isCorrectAnswer;
																// const hasUserSelected = prop.prop_id in userChoices;
																// const isChecked = hasUserSelected
																// 		? isSelectedByUser
																// 		: isCorrectAnswer;
																const isChecked = userChoices[prop.prop_id]?.choices?.includes(option.answer_choice) || false;

                                return (
                                    <label key={option.answer_choice}>
                                        <input
                                            type="checkbox"
                                            name={`variable_option_${prop.prop_id}`}
                                            value={option.answer_choice}
                                            onChange={(e) => handleCheckboxChange(e, option)}
                                            checked={isChecked}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <span>{option.answer_choice} ({option.answer_points})</span>
                                        <br />
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                );
            })}


            <button onClick={handleSetCorrectAnswers}>
                Grade Answers
            </button>
        </div>
    )
}

export default GradeGameForm;
