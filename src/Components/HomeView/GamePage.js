import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUsername } from '../../App';

const GamePage = () => {
    const { leagueName, gameId } = useParams();
    const [overUnderProps, setOverUnderProps] = useState([]);
    const [winnerLoserProps, setWinnerLoserProps] = useState([]);
    const [variableOptionProps, setVariableOptionProps] = useState([]);
    const [userChoices, setUserChoices] = useState({});
    const [isCommissioner, setIsCommissioner] = useState(false);
    const navigate = useNavigate();
    const username = getUsername();
    const [winnerLoserAnswers, setWinnerLoserAnswers] = useState({});
    const [overUnderAnswers, setOverUnderAnswers] = useState({});
    const [variableOptionAnswers, setVariableOptionAnswers] = useState({});
    const [gameStartTime, setGameStartTime] = useState(null);
    const isGameExpired = new Date() > gameStartTime;
    const [allPlayersAnswers, setAllPlayersAnswers] = useState([]);
    const [liveStats, setLiveStats] = useState(null);
    const apiUrl = process.env.REACT_APP_API_URL;

    // const [isGameExpired, setIsGameExpired] = useState(new Date() > gameStartTime);
    // useEffect(() => {
    //     // Check if the game has expired and update state
    //     const interval = setInterval(() => {
    //         const expired = new Date() > gameStartTime;
    //         setIsGameExpired(expired);
    //     }, 300000); // Check every second (adjust if necessary)

    //     return () => clearInterval(interval); // Cleanup interval on unmount
    // }, [gameStartTime]);

    useEffect(() => {
        if (isGameExpired) {
            async function getAnswers() {
                try {
                    const response = await fetch(`${apiUrl}/view_all_answers_for_game?game_id=${gameId}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })

                    if (!response.ok) {
                        console.log("error");
                    }

                    const data = await response.json();
                    setAllPlayersAnswers(data);
                    console.log(data);
                }
                catch (error) {
                    console.log(error);
                }
            }

            getAnswers();
        }
    }, [])

    // Fetch live stats for the game
    useEffect(() => {
        const fetchLiveStats = async () => {
            try {
                const response = await fetch(`${apiUrl}/game/${gameId}/live_stats`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    setLiveStats(data);
                }
            } catch (error) {
                console.error("Error fetching live stats:", error);
            }
        };

        fetchLiveStats();

        // Poll every 30 seconds for live updates
        const interval = setInterval(fetchLiveStats, 30000);

        return () => clearInterval(interval);
    }, [gameId]);

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

                // Fetch user data and compare to check if they are the commissioner
                const userResponse = await fetch(`${apiUrl}/get_user_by_username?username=${encodeURIComponent(username)}`, {
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

                }
            } catch (error) {
                console.error(error); // Log the error
                alert("Something went wrong");
            }
        };

        fetchData();
    }, [leagueName, username, navigate]);

    useEffect(() => {
        fetch(`${apiUrl}/get_game_by_id?game_id=${gameId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                setOverUnderProps(data.over_under_props);
                setWinnerLoserProps(data.winner_loser_props);
                setVariableOptionProps(data.variable_option_props);
                setGameStartTime(new Date(data.start_time));
                console.log(data)
            })
            .catch(error => {
                console.error(error);
                alert("Something went wrong");
            });
    }, [gameId]);

    useEffect(() => {
        fetch(`${apiUrl}/retrieve_winner_loser_answers?leagueName=${encodeURIComponent(leagueName)}&username=${encodeURIComponent(username)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => setWinnerLoserAnswers(data))
            .catch(error => {
                console.error(error);
                alert("Something went wrong");
            });
    }, [leagueName, username]);

    useEffect(() => {
        fetch(`${apiUrl}/retrieve_over_under_answers?leagueName=${encodeURIComponent(leagueName)}&username=${encodeURIComponent(username)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => setOverUnderAnswers(data))
            .catch(error => {
                console.error(error);
                alert("Something went wrong");
            });
    }, [leagueName, username]);

    useEffect(() => {
        fetch(`${apiUrl}/retrieve_variable_option_answers?leagueName=${encodeURIComponent(leagueName)}&username=${encodeURIComponent(username)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => setVariableOptionAnswers(data))
            .catch(error => {
                console.error(error);
                alert("Something went wrong");
            });
    }, [leagueName, username]);

    useEffect(() => {
        const updatedChoices = {};
        for (const [propId, team] of Object.entries(winnerLoserAnswers)) {
            updatedChoices[propId] = { team };
        }
        for (const [propId, choice] of Object.entries(overUnderAnswers)) {
            updatedChoices[propId] = { ...updatedChoices[propId], choice };
        }
        // Add variable option answers
        for (const [propId, option] of Object.entries(variableOptionAnswers)) {
            updatedChoices[propId] = { ...updatedChoices[propId], option };
        }

        console.log("Winner Loser Answers:", winnerLoserAnswers);
        console.log("Over Under Answers:", overUnderAnswers);
        console.log("Variable Option Answers:", variableOptionAnswers);

        setUserChoices(updatedChoices);
        console.log(updatedChoices)
    }, [winnerLoserAnswers, overUnderAnswers, variableOptionAnswers]);

    const handleWinnerLoserProp = (prop_id, answer) => {
        if (isGameExpired) {
            return;
        }
        const data = { leagueName, username, prop_id, answer };
        fetch(`${apiUrl}/answer_winner_loser_prop`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (response.ok) {
                    // Update BOTH userChoices AND winnerLoserAnswers to prevent race condition
                    setUserChoices(prevChoices => ({
                        ...prevChoices,
                        [prop_id]: { ...prevChoices[prop_id], team: answer }
                    }));
                    setWinnerLoserAnswers(prevAnswers => ({
                        ...prevAnswers,
                        [prop_id]: answer
                    }));
                } else {
                    alert("Answer was not saved");
                }
            })
            .catch(error => console.log("Error saving answer"));
    };

    const handleOverUnderProp = (prop_id, answer) => {
        if (isGameExpired) {
            return;
        }
        const data = { leagueName, username, prop_id, answer };
        fetch(`${apiUrl}/answer_over_under_prop`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (response.ok) {
                    // Update BOTH userChoices AND overUnderAnswers to prevent race condition
                    setUserChoices(prevChoices => ({
                        ...prevChoices,
                        [prop_id]: { ...prevChoices[prop_id], choice: answer }
                    }));
                    setOverUnderAnswers(prevAnswers => ({
                        ...prevAnswers,
                        [prop_id]: answer
                    }));
                } else {
                    alert("Answer was not saved");
                }
            })
            .catch(error => console.log("Error saving answer"));
    };

    const handleVariableOptionProp = (prop_id, answer) => {
        if (isGameExpired) {
            return;
        }
        const data = { leagueName, username, prop_id, answer };
        fetch(`${apiUrl}/answer_variable_option_prop`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (response.ok) {
                    // Update BOTH userChoices AND variableOptionAnswers to prevent race condition
                    setUserChoices(prevChoices => ({
                        ...prevChoices,
                        [prop_id]: { ...prevChoices[prop_id], option: answer }
                    }));
                    setVariableOptionAnswers(prevAnswers => ({
                        ...prevAnswers,
                        [prop_id]: answer
                    }));
                } else {
                    alert("Answer was not saved");
                }
            })
            .catch(error => console.log("Error saving answer"));
    };

    const handleNavigation = () => {
        navigate(`/league-home/${leagueName}/setCorrectAnswers/${gameId}`);
    };

    const handleNavigationToEditGame = () => {
        navigate(`/league-home/${leagueName}/editGame/${gameId}`);
    };

    // Helper function to get live stats for a specific over/under prop
    const getOverUnderLiveStats = (propId) => {
        if (!liveStats || !liveStats.over_under_props) return null;
        return liveStats.over_under_props.find(p => p.prop_id === propId);
    };

    // Helper function to get live stats for a specific winner/loser prop
    const getWinnerLoserLiveStats = (propId) => {
        if (!liveStats || !liveStats.winner_loser_props) return null;
        return liveStats.winner_loser_props.find(p => p.prop_id === propId);
    };

    return (
        <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Game Form</h3>

            {isGameExpired && (
                <div className="bg-red-100 text-red-600 p-4 rounded-md mb-4">
                    <h3 className="text-lg font-semibold">Answers are locked!</h3>
                </div>
            )}

            <div className="flex flex-col items-center space-y-8">
                {/* Render Winner-Loser Props */}
                {winnerLoserProps.map((prop, index) => {
                    const propLiveStats = getWinnerLoserLiveStats(prop.prop_id);
                    return (
                    <div
                        key={prop.prop_id}
                        className="w-full max-w-md p-4 border border-gray-300 rounded-lg shadow-sm bg-white"
                    >
                        <h4 className="text-lg font-bold text-gray-700 mb-4 text-center">
                            {prop.question}
                        </h4>

                        {/* Live Score Display */}
                        {propLiveStats && propLiveStats.team_a_name && propLiveStats.team_b_name && (
                            <div className="mb-3 p-2 bg-blue-50 rounded text-center">
                                {propLiveStats.team_a_score !== null && propLiveStats.team_b_score !== null ? (
                                    <span className="text-sm font-semibold text-blue-900">
                                        {liveStats.is_completed ? 'Final' : 'Live'}: {propLiveStats.team_a_score} - {propLiveStats.team_b_score}
                                    </span>
                                ) : (
                                    <span className="text-sm text-gray-500">
                                        {propLiveStats.team_a_name} vs {propLiveStats.team_b_name} - Not started
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="flex flex-col space-y-4">
                            <label className="flex items-center space-x-3">
                                <input
                                    type="radio"
                                    name={`game_${gameId}_winner_${index}`}
                                    value={prop.favorite_team}
                                    onChange={() => handleWinnerLoserProp(prop.prop_id, prop.favorite_team)}
                                    checked={userChoices[prop.prop_id]?.team === prop.favorite_team}
                                    disabled={isGameExpired}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="text-gray-700">
                                    {prop.favorite_team} ({prop.favorite_points})
                                </span>
                            </label>
                            <label className="flex items-center space-x-3">
                                <input
                                    type="radio"
                                    name={`game_${gameId}_winner_${index}`}
                                    value={prop.underdog_team}
                                    onChange={() => handleWinnerLoserProp(prop.prop_id, prop.underdog_team)}
                                    checked={userChoices[prop.prop_id]?.team === prop.underdog_team}
                                    disabled={isGameExpired}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="text-gray-700">
                                    {prop.underdog_team} ({prop.underdog_points})
                                </span>
                            </label>
                        </div>
                    </div>
                    );
                })}

                {/* Render Over-Under Props */}
                {overUnderProps.map((prop, index) => {
                    const propLiveStats = getOverUnderLiveStats(prop.prop_id);
                    return (
                    <div
                        key={prop.prop_id}
                        className="w-full max-w-md p-4 border border-gray-300 rounded-lg shadow-sm bg-white"
                    >
                        {console.log(prop)}
                        <h4 className="text-lg font-bold text-gray-700 mb-4 text-center">
                            {prop.question}
                        </h4>

                        {/* Live Stats Display */}
                        {propLiveStats && propLiveStats.player_name && (
                            <div className="mb-3 p-2 bg-green-50 rounded">
                                <div className="text-sm text-gray-600 text-center">
                                    {propLiveStats.player_name} - {propLiveStats.stat_type?.replace(/_/g, ' ')}
                                </div>
                                <div className="text-center mt-1">
                                    {propLiveStats.current_value !== null ? (
                                        <span className="text-lg font-bold text-green-700">
                                            {propLiveStats.current_value}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-gray-400">No data yet</span>
                                    )}
                                    {propLiveStats.line_value !== null && (
                                        <span className="text-sm text-gray-500 ml-1">
                                            / {propLiveStats.line_value}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col space-y-4">
                            <label className="flex items-center space-x-3">
                                <input
                                    type="radio"
                                    name={`game_${gameId}_over_under_${index}`}
                                    value="over"
                                    onChange={() => handleOverUnderProp(prop.prop_id, 'over')}
                                    checked={userChoices[prop.prop_id]?.choice === 'over'}
                                    disabled={isGameExpired}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="text-gray-700">Over ({prop.over_points})</span>
                            </label>
                            <label className="flex items-center space-x-3">
                                <input
                                    type="radio"
                                    name={`game_${gameId}_over_under_${index}`}
                                    value="under"
                                    onChange={() => handleOverUnderProp(prop.prop_id, 'under')}
                                    checked={userChoices[prop.prop_id]?.choice === 'under'}
                                    disabled={isGameExpired}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="text-gray-700">Under ({prop.under_points})</span>
                            </label>
                        </div>
                    </div>
                    );
                })}

                {variableOptionProps.map((prop, index) => (
                    <div
                        key={index}
                        className="w-full max-w-md p-4 border border-gray-300 rounded-lg shadow-sm bg-white"
                    >
                        <h4 className="text-lg font-bold text-gray-700 mb-4 text-center">
                            {prop.question}
                        </h4>
                        <div className="flex flex-col space-y-4">
                            {prop.options
                                .slice() // Create a shallow copy to avoid mutating the original array
                                .sort((a, b) => a.answer_points - b.answer_points) // Sort by answer_points (ascending)
                                .map((option, idx) => (
                                    <label key={idx} className="flex items-center space-x-3">
                                        <input
                                            type="radio"
                                            name={`game_${gameId}_variable_option_${index}`}
                                            value={option.answer_choice} // Use the answer choice as the value
                                            onChange={() => handleVariableOptionProp(prop.prop_id, option.answer_choice)}
                                            checked={userChoices[prop.prop_id]?.option === option.answer_choice}
                                            disabled={isGameExpired}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <span className="text-gray-700">
                                            {option.answer_choice} ({option.answer_points})
                                        </span>
                                    </label>
                                ))}
                        </div>
                    </div>
                ))}
            </div>


            {isCommissioner && !isGameExpired && <button onClick={() => handleNavigationToEditGame(gameId)} class="bg-yellow-600 hover:bg-yellow-700">
                Edit Game
            </button>}

            {isCommissioner && <button onClick={() => handleNavigation(gameId)} class="bg-green-600 hover:bg-green-700">
                Grade Game
            </button>}


            {isGameExpired &&
                Object.entries(
                    allPlayersAnswers.reduce((acc, answer) => {
                        // Group answers by the question
                        if (!acc[answer.question]) {
                            acc[answer.question] = [];
                        }
                        acc[answer.question].push(answer);
                        return acc;
                    }, {})
                ).map(([question, answers], index) => (
                    <div key={index} className="mb-4">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-4 py-2 text-sm font-semibold text-gray-600">Player Name</th>
                                    <th className="px-4 py-2 text-sm font-semibold text-gray-600">{question}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {console.log(answers)}
                                {answers.map((answer, answerIndex) => (
                                    <tr key={answerIndex} className="border-t border-gray-200">
                                        <td className="px-4 py-2 text-sm text-gray-700">{answer.player_name}</td>
                                        {answer.correct_answer === null && (
                                            <td className="px-4 py-2 text-sm text-gray-700">{answer.answer}</td>
                                        )}
                                        {(Array.isArray(answer.correct_answer) && answer.correct_answer.includes(answer.answer)) ||
                                            (answer.correct_answer === answer.answer) ? (
                                            <td className="px-4 py-2 text-sm text-gray-700 bg-green-500">{answer.answer}</td>
                                        ) : (
                                            answer.correct_answer !== null && (
                                                <td className="px-4 py-2 text-sm text-gray-700 bg-red-500">{answer.answer}</td>
                                            )
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
        </div>
    );
};

export default GamePage;
