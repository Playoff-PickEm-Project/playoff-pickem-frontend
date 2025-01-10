import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUsername } from '../../App';

const GamePage = () => {
    const { leagueName, gameId } = useParams();
    const [overUnderProps, setOverUnderProps] = useState([]);
    const [winnerLoserProps, setWinnerLoserProps] = useState([]);
    const [userChoices, setUserChoices] = useState({});
    const [isCommissioner, setIsCommissioner] = useState(false);
    const navigate = useNavigate();
    const username = getUsername();
    const [winnerLoserAnswers, setWinnerLoserAnswers] = useState({});
    const [overUnderAnswers, setOverUnderAnswers] = useState({});
    const [gameStartTime, setGameStartTime] = useState(null);
    const isGameExpired = new Date() > gameStartTime;

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch league data
                const leagueResponse = await fetch(`http://127.0.0.1:5000/get_league_by_name?leagueName=${leagueName}`, {
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
                const userResponse = await fetch(`http://127.0.0.1:5000/get_user_by_username?username=${username}`, {
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
        fetch(`http://127.0.0.1:5000/get_game_by_id?game_id=${gameId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            setOverUnderProps(data.over_under_props);
            setWinnerLoserProps(data.winner_loser_props);
            setGameStartTime(new Date(data.start_time));
        })
        .catch(error => {
            console.error(error);
            alert("Something went wrong");
        });
    }, [gameId]);

    useEffect(() => {
        fetch(`http://127.0.0.1:5000/retrieve_winner_loser_answers?leagueName=${leagueName}&username=${username}`, {
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
        fetch(`http://127.0.0.1:5000/retrieve_over_under_answers?leagueName=${leagueName}&username=${username}`, {
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
        const updatedChoices = {};
        for (const [propId, team] of Object.entries(winnerLoserAnswers)) {
            updatedChoices[propId] = { team };
        }
        for (const [propId, choice] of Object.entries(overUnderAnswers)) {
            updatedChoices[propId] = { ...updatedChoices[propId], choice };
        }
        setUserChoices(updatedChoices);
    }, [winnerLoserAnswers, overUnderAnswers]);

    const handleWinnerLoserProp = (prop_id, answer) => {
        if (isGameExpired) {
            return;
        }
        const data = { leagueName, username, prop_id, answer };
        fetch("http://127.0.0.1:5000/answer_winner_loser_prop", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) {
                // Update userChoices immediately after saving
                setUserChoices(prevChoices => ({
                    ...prevChoices,
                    [prop_id]: { team: answer }
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
        fetch("http://127.0.0.1:5000/answer_over_under_prop", {
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

    const handleNavigation = () => {
        navigate(`/league-home/${leagueName}/setCorrectAnswers/${gameId}`);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h3>Game Form</h3>
            {isGameExpired && 
                <h3>Answers are locked!</h3>}
            {/* Render winner-loser props */}
            {winnerLoserProps.map((prop, index) => (
                <div key={index}>
                    <h4>{prop.question}</h4>
                    <div>
                        <label>
                            <input
                                type="radio"
                                name={`game_${gameId}_winner_${index}`}
                                value={prop.favorite_team}
                                onChange={() => handleWinnerLoserProp(prop.prop_id, prop.favorite_team)}
                                checked={userChoices[prop.prop_id]?.team === prop.favorite_team}
                                disabled={isGameExpired}
                            />
                            {prop.favorite_team} ({prop.favorite_points})
                        </label>
                    </div>
                    <div>
                        <label>
                            <input
                                type="radio"
                                name={`game_${gameId}_winner_${index}`}
                                value={prop.underdog_team}
                                onChange={() => handleWinnerLoserProp(prop.prop_id, prop.underdog_team)}
                                checked={userChoices[prop.prop_id]?.team === prop.underdog_team}
                                disabled={isGameExpired}
                            />
                            {prop.underdog_team} ({prop.underdog_points})
                        </label>
                    </div>
                </div>
            ))}

            {/* Render over-under props */}
            {overUnderProps.map((prop, index) => (
                <div key={index}>
                    <h4>{prop.question}</h4>
                    <div>
                        <label>
                            <input
                                type="radio"
                                name={`game_${gameId}_over_under_${index}`}
                                value="over"
                                onChange={() => handleOverUnderProp(prop.prop_id, 'over')}
                                checked={userChoices[prop.prop_id]?.choice === 'over'}
                                disabled={isGameExpired}
                            />
                            Over ({prop.over_points})
                        </label>
                    </div>
                    <div>
                        <label>
                            <input
                                type="radio"
                                name={`game_${gameId}_over_under_${index}`}
                                value="under"
                                onChange={() => handleOverUnderProp(prop.prop_id, 'under')}
                                checked={userChoices[prop.prop_id]?.choice === 'under'}
                                disabled={isGameExpired}
                            />
                            Under ({prop.under_points})
                        </label>
                    </div>
                </div>
            ))}

            {isCommissioner && <button onClick={() => handleNavigation(gameId)} class="bg-green-600 hover:bg-green-700">
                Grade All Answers
            </button>}
        </div>
    );
};

export default GamePage;
