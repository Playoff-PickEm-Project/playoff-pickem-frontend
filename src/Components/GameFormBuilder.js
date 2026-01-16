import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Fuse from "fuse.js";

const GameFormBuilder = () => {
  const [formName, setFormName] = useState("");
  const [questions, setQuestions] = useState([]);
  const [gameStartDate, setGameStartDate] = useState(new Date().toISOString());
  const [externalGameId, setExternalGameId] = useState(""); // ESPN game ID
  const [availablePlayers, setAvailablePlayers] = useState([]); // Players from ESPN
  const [upcomingGames, setUpcomingGames] = useState([]); // ESPN upcoming games
  const [loadingGames, setLoadingGames] = useState(false);
  const [playerSearchQuery, setPlayerSearchQuery] = useState({}); // Search query per question
  const [filteredPlayers, setFilteredPlayers] = useState({}); // Filtered players per question
  const [showPlayerDropdown, setShowPlayerDropdown] = useState({}); // Show/hide dropdown per question
  const [propLimit, setPropLimit] = useState(2); // How many optional props players must select
  const { formId } = useParams();
  const { leagueName } = useParams();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  // Fetch upcoming NFL games from ESPN
  const fetchUpcomingGames = async () => {
    setLoadingGames(true);
    try {
      const response = await fetch(`${apiUrl}/scoreboard`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const games = data.events || [];
        setUpcomingGames(games);
      } else {
        console.error("Failed to fetch upcoming games");
      }
    } catch (error) {
      console.error("Error fetching upcoming games:", error);
    } finally {
      setLoadingGames(false);
    }
  };

  // Fetch upcoming games when component mounts
  useEffect(() => {
    fetchUpcomingGames();
  }, []);

  // Fetch available players for the selected game
  const fetchPlayersForGame = async (espnGameId) => {
    try {
      console.log("Fetching players for ESPN game ID:", espnGameId);
      const response = await fetch(`${apiUrl}/espn_game/${espnGameId}/available_players`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Players fetched:", data.players);
        setAvailablePlayers(data.players || []);
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch players:", response.status, errorData);
        setAvailablePlayers([]);
      }
    } catch (error) {
      console.error("Error fetching players:", error);
      setAvailablePlayers([]);
    }
  };

  // Get teams from selected game
  const getTeamsFromSelectedGame = () => {
    if (!externalGameId) return [];
    const selectedGame = upcomingGames.find(g => g.id === externalGameId);
    if (!selectedGame || !selectedGame.competitions || !selectedGame.competitions[0]) return [];

    const competitors = selectedGame.competitions[0].competitors || [];
    return competitors.map(comp => ({
      id: comp.team?.abbreviation || comp.team?.id,
      name: comp.team?.displayName || comp.team?.name,
      abbreviation: comp.team?.abbreviation
    }));
  };

  const handleCreateGame = () => {
    async function createGame() {
      if (!(gameStartDate instanceof Date)) {
        alert("Select a date.")
        return;
      }
      
      const now = new Date();
      if (gameStartDate < now) {
        alert("Please choose a date in the future.");
        return;
      }

      const overUnderQuestions = [];
      const winnerLoserQuestions = [];
      const variableOptionQuestions = [];
      // Ensure "Over" and "Under" are added to each question when needed
      const updatedQuestions = questions.map(item => {
        // Check if it's an over/under question
        if (item.field_type === 'over_under') {
          // Check if "Over" and "Under" are already in the choices array, otherwise add them
          const hasOver = item.choices.some(choice => choice.choice_text.toLowerCase() === 'over');
          const hasUnder = item.choices.some(choice => choice.choice_text.toLowerCase() === 'under');

          if (!hasOver) {
            item.choices.push({ choice_text: "Over", points: 0 }); // default points to 0
          }

          if (!hasUnder) {
            item.choices.push({ choice_text: "Under", points: 0 }); // default points to 0
          }
        }

        return item;
      });

      questions.forEach(item => {
        if (item.field_type === 'select_winner') {
          // Sort choices by points (lower points = favorite, higher points = underdog)
          const sortedChoices = item.choices.sort((a, b) => a.points - b.points);

          winnerLoserQuestions.push({
            question: item.label,
            favoritePoints: sortedChoices[0].points,
            underdogPoints: sortedChoices[1].points,
            favoriteTeam: sortedChoices[0].choice_text,
            underdogTeam: sortedChoices[1].choice_text,
            favoriteTeamId: sortedChoices[0].team_id || null,
            underdogTeamId: sortedChoices[1].team_id || null,
            is_mandatory: item.is_mandatory !== undefined ? item.is_mandatory : true
          });
        }

        if (item.field_type === 'over_under') {
          const overChoice = item.choices.find(choice => choice.choice_text.toLowerCase() === 'over');
          const underChoice = item.choices.find(choice => choice.choice_text.toLowerCase() === 'under');

          overUnderQuestions.push({
            question: item.label,
            overPoints: overChoice.points,
            underPoints: underChoice.points,
            playerName: item.player_name || null,
            playerId: item.player_id || null,
            statType: item.stat_type || null,
            lineValue: item.line_value || null,
            is_mandatory: item.is_mandatory !== undefined ? item.is_mandatory : false
          });
        }

        if (item.field_type === 'custom_select') {
          variableOptionQuestions.push({
            question: item.label,
            options: item.choices,
            is_mandatory: item.is_mandatory !== undefined ? item.is_mandatory : false
          });
        }
      });

      console.log(overUnderQuestions);
      console.log(winnerLoserQuestions);
      console.log(variableOptionQuestions);

      const data = {
        leagueName: leagueName,
        gameName: formName,
        date: gameStartDate.toISOString(),
        externalGameId: externalGameId || null, // ESPN game ID for polling
        propLimit: propLimit,
        winnerLoserQuestions: winnerLoserQuestions,
        overUnderQuestions: overUnderQuestions,
        variableOptionQuestions: variableOptionQuestions
      }

      console.log("=== SENDING CREATE GAME REQUEST ===");
      console.log("propLimit value:", propLimit, "(type:", typeof propLimit, ")");
      console.log("Full data being sent:", JSON.stringify(data, null, 2));
      console.log("===================================");

      try {
        const response = await fetch(`${apiUrl}/create_game`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(data)
        })

        if (response.ok) {
          alert("Game created successfully!");
          navigate(`/league-home/${leagueName}/league_manager_tools`);
        }
        else {
          alert(`Error creating game: ${response.status}`);
        }
      }
      catch (error) {
        // Safari iOS bug: shows "Load failed" even when backend succeeds
        // Check if it's this specific error and treat as success
        if (error.message && error.message.toLowerCase().includes('load fail')) {
          console.warn("Safari 'Load failed' error (backend confirms success)");
          alert("Game created successfully!");
          navigate(`/league-home/${leagueName}/league_manager_tools`);
        } else {
          // Real network error
          console.error("Network/CORS error:", error);
          alert(`Network error: ${error.message}`);
        }
      }
    }

    createGame();
  }

  useEffect(() => {
    console.log(questions)
  }, [questions])

  useEffect(() => {
    const getFormData = () => {
      if (formId) {
        const mockFormData = {
          name: "Sample Form",
          questions: [
            {
              label: "Select the winner",
              field_type: "select_winner",
              choices: [
                { choice_text: "Team A", points: 5 },
                { choice_text: "Team B", points: 5 },
              ],
            },
            {
              label: "Over/Under",
              field_type: "over_under",
              choices: [
                { choice_text: "Over", points: 5},
                { choice_text: "Under", points: 5},
              ]
            },
            {
              label: "Custom Radio",
              field_type: "custom_radio",
              choices: [
                { choice_text: "Option 1", points: 2 },
                { choice_text: "Option 2", points: 3 },
              ],
            },
            {
              label: "Custom Select",
              field_type: "custom_select",
              choices: [
                { choice_text: "Option A", points: 1 },
                { choice_text: "Option B", points: 2 },
              ],
            },
          ],
        };

        setFormName(mockFormData.name);
        setQuestions(mockFormData.questions);
      }
    };

    getFormData();
  }, [formId]);

  const handleQuestionChange = (e, questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex][e.target.name] = e.target.value;

    // Update is_mandatory default when field_type changes
    if (e.target.name === 'field_type') {
      updatedQuestions[questionIndex].is_mandatory = e.target.value === 'select_winner';
    }

    setQuestions(updatedQuestions);
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      label: "",
      field_type: "select_winner", // Default type for new question
      is_mandatory: true, // Winner/Loser defaults to mandatory
      choices: [
        { choice_text: "", points: 0 },
        { choice_text: "", points: 0 },
      ],
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleDeleteQuestion = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(questionIndex, 1);
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (e, questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].choices[optionIndex] = {
      choice_text: e.target.value,
      points: updatedQuestions[questionIndex].choices[optionIndex].points,
    };
    setQuestions(updatedQuestions);
  };

  const handleOptionPointsChange = (e, questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].choices[optionIndex] = {
      choice_text: updatedQuestions[questionIndex].choices[optionIndex].choice_text,
      points: parseFloat(e.target.value), // Allows for decimal points
    };
    setQuestions(updatedQuestions);
  };

  const handleAddOption = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].choices.push({ choice_text: "", points: 0 });
    setQuestions(updatedQuestions);
  };

  const handleDeleteOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].choices.splice(optionIndex, 1);
    setQuestions(updatedQuestions);
  };

  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    setGameStartDate(selectedDate); // Convert back to ISO string if needed
  };

  // Modify to ensure correct format and use local time
  function getLocalDateString(date) {
    const localDate = new Date(date);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(localDate.getDate()).padStart(2, '0');
    const hours = String(localDate.getHours()).padStart(2, '0');
    const minutes = String(localDate.getMinutes()).padStart(2, '0');
    
    // Format in YYYY-MM-DDTHH:mm
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      name: formName,
      questions: questions,
    };

    if (formId) {
      console.log("Form Updated Successfully");
      navigate("/");
    } else {
      console.log("Form Created Successfully");
      setFormName("");
      setQuestions([]);
      navigate("/");
    }
  };

  useEffect(() =>{
    console.log(questions)
  }, [questions])

  const handleOverUnderPointsChange = (e, questionIndex, pointValue, choice) => {
    const updatedQuestions = [...questions];
  
    // Find the choice corresponding to the option (Over or Under)
    const choiceIndex = updatedQuestions[questionIndex].choices.findIndex(
      (c) => c.choice_text.toLowerCase() === choice.toLowerCase()
    );
  
    // If the choice exists, update its points
    if (choiceIndex !== -1) {
      updatedQuestions[questionIndex].choices[choiceIndex].points = parseFloat(e.target.value); // update points
    } 
    // If the choice doesn't exist, add it with the points passed as an argument
    else {
      updatedQuestions[questionIndex].choices.push({
        choice_text: choice, // Add the choice (Over or Under)
        points: parseFloat(e.target.value), // Set the points
      });
    }
  
    // Update the state with the modified questions
    setQuestions(updatedQuestions);
  };

  return (
    <div className="container mx-auto my-8 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {formId ? "Edit Form" : "Create Form"}
        </h1>
        <Link to="/" className="text-sm text-blue-500 hover:underline">
          Back to Forms
        </Link>
      </div>

      <form onSubmit={handleCreateGame}>
        <div className="mb-4">
          <label htmlFor="formName" className="block text-sm font-medium text-gray-700">
            Form Name
          </label>
          <input
            type="text"
            name="formName"
            id="formName"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter form name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="gameStartDateTime" className="block text-sm font-medium text-gray-700">
            Game Start Date & Time
          </label>
          <input
            type="datetime-local"
            id="gameStartDateTime"
            name="gameStartDateTime"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={getLocalDateString(gameStartDate)}
            onChange={handleDateChange}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="externalGameId" className="block text-sm font-medium text-gray-700">
            Select NFL Game (Optional - for live polling)
          </label>
          {loadingGames ? (
            <p className="mt-1 text-sm text-gray-500">Loading upcoming games...</p>
          ) : (
            <select
              id="externalGameId"
              name="externalGameId"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={externalGameId}
              onChange={(e) => {
                const selectedGameId = e.target.value;
                setExternalGameId(selectedGameId);

                // Auto-fill game name and date if a game is selected
                if (selectedGameId) {
                  const selectedGame = upcomingGames.find(g => g.id === selectedGameId);
                  if (selectedGame) {
                    // Replace " at " with " @ " in game name
                    const gameName = (selectedGame.name || selectedGame.shortName).replace(/ at /gi, ' @ ');
                    setFormName(gameName);
                    setGameStartDate(new Date(selectedGame.date));
                  }
                  // Fetch players for this game
                  fetchPlayersForGame(selectedGameId);
                } else {
                  setAvailablePlayers([]);
                }
              }}
            >
              <option value="">-- No live polling (manual game) --</option>
              {upcomingGames.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name} - {new Date(game.date).toLocaleString()}
                </option>
              ))}
            </select>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Select an upcoming NFL game for automatic live stat polling, or leave blank for a manual game.
          </p>
        </div>

        <div className="mb-4">
          <label htmlFor="propLimit" className="block text-sm font-medium text-gray-700">
            Number of Optional Props Players Must Answer
          </label>
          <input
            type="number"
            id="propLimit"
            name="propLimit"
            min="0"
            max="20"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={propLimit}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setPropLimit(isNaN(val) ? 0 : val);
            }}
          />
          <p className="mt-1 text-xs text-gray-500">
            Players must select and answer this many optional props. Mandatory props are always required. Set to 0 if all props are mandatory.
          </p>
        </div>

        <hr className="my-6 border-gray-300" />

        <ul className="space-y-4">
          {questions.map((question, questionIndex) => (
            <li key={questionIndex} className="p-4 border border-gray-200 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <input
                  type="text"
                  name="label"
                  placeholder="Question Label"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                  value={question.label}
                  onChange={(e) => handleQuestionChange(e, questionIndex)}
                />
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm"
                  type="button"
                  onClick={() => handleDeleteQuestion(questionIndex)}
                >
                  Delete Question
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-700">Field Type</label>
                <select
                  name="field_type"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  defaultValue={question.field_type}
                  onChange={(e) => handleQuestionChange(e, questionIndex)}
                >
                  <option value="">Select Field Type</option>
                  <option value="select_winner">Select Winner</option>
                  <option value="over_under">Over/Under</option>
                  {/* <option value="custom_radio">Custom Radio</option> */}
                  <option value="custom_select">Custom Select</option>
                </select>
              </div>

              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id={`mandatory-${questionIndex}`}
                  checked={question.is_mandatory !== undefined ? question.is_mandatory : (question.field_type === 'select_winner')}
                  onChange={(e) => {
                    const updatedQuestions = [...questions];
                    updatedQuestions[questionIndex].is_mandatory = e.target.checked;
                    setQuestions(updatedQuestions);
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={`mandatory-${questionIndex}`} className="ml-2 text-sm text-gray-700">
                  Mandatory prop (all players must answer)
                </label>
              </div>

              {question.field_type === "select_winner" && (
                <div>
                  <h4 className="font-medium text-gray-700">Teams</h4>
                  {externalGameId && getTeamsFromSelectedGame().length > 0 ? (
                    <ul className="space-y-2">
                      {question.choices.map((option, optionIndex) => (
                        <li key={optionIndex} className="flex items-center space-x-2">
                          <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-md"
                            value={option.choice_text}
                            onChange={(e) => {
                              const selectedTeam = getTeamsFromSelectedGame().find(t => t.name === e.target.value);
                              const updatedQuestions = [...questions];
                              updatedQuestions[questionIndex].choices[optionIndex] = {
                                choice_text: e.target.value,
                                points: updatedQuestions[questionIndex].choices[optionIndex].points,
                                team_id: selectedTeam?.id || null
                              };
                              setQuestions(updatedQuestions);
                            }}
                          >
                            <option value="">Select Team {optionIndex + 1}</option>
                            {getTeamsFromSelectedGame().map((team) => (
                              <option key={team.id} value={team.name}>
                                {team.name} ({team.abbreviation})
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            name="points"
                            placeholder="Points"
                            value={option.points}
                            onChange={(e) => handleOptionPointsChange(e, questionIndex, optionIndex)}
                            className="w-24 px-4 py-2 border border-gray-300 rounded-md"
                            min="0"
                            step="0.5"
                          />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="space-y-2">
                      {question.choices.map((option, optionIndex) => (
                        <li key={optionIndex} className="flex items-center space-x-2">
                          <input
                            type="text"
                            name="option"
                            placeholder="Team name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md"
                            value={option.choice_text}
                            onChange={(e) => handleOptionChange(e, questionIndex, optionIndex)}
                          />
                          <input
                            type="number"
                            name="points"
                            value={option.points}
                            onChange={(e) => handleOptionPointsChange(e, questionIndex, optionIndex)}
                            className="w-24 px-4 py-2 border border-gray-300 rounded-md"
                            min="0"
                            step="0.5"
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    {externalGameId ? "Teams auto-populated from selected game" : "Select an NFL game above to auto-populate teams"}
                  </p>
                </div>
              )}

              {question.field_type === "custom_radio" && (
                <div>
                  <h4 className="font-medium text-gray-700">Options</h4>
                  <ul className="space-y-2">
                    {question.choices.map((option, optionIndex) => (
                      <li key={optionIndex} className="flex items-center space-x-2">
                        <input
                          type="text"
                          name="option"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md"
                          value={option.choice_text}
                          onChange={(e) => handleOptionChange(e, questionIndex, optionIndex)}
                        />
                        <input
                          type="number"
                          name="points"
                          value={option.points}
                          onChange={(e) => handleOptionPointsChange(e, questionIndex, optionIndex)}
                          className="w-24 px-4 py-2 border border-gray-300 rounded-md"
                          min="0"
                          step="0.1" // Allows half-point values
                        />
                        <button
                          type="button"
                          className="bg-red-500 text-white px-2 py-1 rounded-md text-sm"
                          onClick={() => handleDeleteOption(questionIndex, optionIndex)}
                        >
                          Remove Option
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md mt-3"
                    onClick={() => handleAddOption(questionIndex)}
                  >
                    Add Option
                  </button>
                </div>
              )}

              {question.field_type === "custom_select" && (
                <div>
                  <h4 className="font-medium text-gray-700">Options</h4>
                  <ul className="space-y-2">
                    {question.choices.map((option, optionIndex) => (
                      <li key={optionIndex} className="flex items-center space-x-2">
                        <input
                          type="text"
                          name="option"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md"
                          value={option.choice_text}
                          onChange={(e) => handleOptionChange(e, questionIndex, optionIndex)}
                        />
                        <input
                          type="number"
                          name="points"
                          value={option.points}
                          onChange={(e) => handleOptionPointsChange(e, questionIndex, optionIndex)}
                          className="w-24 px-4 py-2 border border-gray-300 rounded-md"
                          min="0"
                          step="0.5" // Allows half-point values
                        />
                        <button
                          type="button"
                          className="bg-red-500 text-white px-2 py-1 rounded-md text-sm"
                          onClick={() => handleDeleteOption(questionIndex, optionIndex)}
                        >
                          Remove Option
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md mt-3"
                    onClick={() => handleAddOption(questionIndex)}
                  >
                    Add Option
                  </button>
                </div>
              )}

              {question.field_type === "over_under" && (
                <div>
                  <h4 className="font-medium text-gray-700">Player Prop Details</h4>
                  {externalGameId && availablePlayers.length > 0 ? (
                    <div className="space-y-3">
                      {/* Player Selection with Fuzzy Search */}
                      <div className="relative">
                        <label className="block text-sm text-gray-600 mb-1">Select Player</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md"
                          placeholder="Search for a player..."
                          value={playerSearchQuery[questionIndex] || question.player_name || ""}
                          onChange={(e) => {
                            const searchValue = e.target.value;
                            setPlayerSearchQuery({ ...playerSearchQuery, [questionIndex]: searchValue });
                            setShowPlayerDropdown({ ...showPlayerDropdown, [questionIndex]: true });

                            // Fuzzy search
                            if (searchValue.trim() === "") {
                              setFilteredPlayers({ ...filteredPlayers, [questionIndex]: availablePlayers });
                            } else {
                              const fuse = new Fuse(availablePlayers, {
                                keys: ["name", "position"],
                                threshold: 0.3,
                              });
                              const results = fuse.search(searchValue);
                              setFilteredPlayers({
                                ...filteredPlayers,
                                [questionIndex]: results.map(r => r.item)
                              });
                            }
                          }}
                          onFocus={() => {
                            setShowPlayerDropdown({ ...showPlayerDropdown, [questionIndex]: true });
                            if (!filteredPlayers[questionIndex]) {
                              setFilteredPlayers({ ...filteredPlayers, [questionIndex]: availablePlayers });
                            }
                          }}
                          onBlur={() => {
                            // Delay to allow click on dropdown item
                            setTimeout(() => {
                              setShowPlayerDropdown({ ...showPlayerDropdown, [questionIndex]: false });
                            }, 200);
                          }}
                        />
                        {showPlayerDropdown[questionIndex] && (filteredPlayers[questionIndex] || availablePlayers).length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {(filteredPlayers[questionIndex] || availablePlayers).map((player) => (
                              <div
                                key={player.id}
                                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                onClick={() => {
                                  const updatedQuestions = [...questions];
                                  updatedQuestions[questionIndex].player_name = player.name;
                                  updatedQuestions[questionIndex].player_id = player.id;
                                  setQuestions(updatedQuestions);
                                  setPlayerSearchQuery({ ...playerSearchQuery, [questionIndex]: player.name });
                                  setShowPlayerDropdown({ ...showPlayerDropdown, [questionIndex]: false });
                                }}
                              >
                                {player.name} ({player.position})
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Stat Type Selection */}
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Stat Type</label>
                        <select
                          className="w-full px-4 py-2 border border-gray-300 rounded-md"
                          value={question.stat_type || ""}
                          onChange={(e) => {
                            const updatedQuestions = [...questions];
                            updatedQuestions[questionIndex].stat_type = e.target.value;
                            setQuestions(updatedQuestions);
                          }}
                        >
                          <option value="">-- Select stat type --</option>
                          <option value="passing_yards">Passing Yards</option>
                          <option value="passing_tds">Passing TDs</option>
                          <option value="passing_interceptions">Passing Interceptions</option>
                          <option value="passing_completions">Passing Completions</option>
                          <option value="rushing_yards">Rushing Yards</option>
                          <option value="rushing_tds">Rushing TDs</option>
                          <option value="receiving_yards">Receiving Yards</option>
                          <option value="receiving_tds">Receiving TDs</option>
                          <option value="receiving_receptions">Receptions</option>
                          <option value="scrimmage_yards">Scrimmage Yards (Rush + Rec)</option>
                        </select>
                      </div>

                      {/* Line Value */}
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Line (Over/Under)</label>
                        <input
                          type="number"
                          step="0.5"
                          placeholder="e.g., 250.5"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md"
                          value={question.line_value || ""}
                          onChange={(e) => {
                            const updatedQuestions = [...questions];
                            updatedQuestions[questionIndex].line_value = e.target.value;
                            setQuestions(updatedQuestions);
                          }}
                        />
                      </div>

                      {/* Points for Over/Under */}
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Points</label>
                        <ul className="space-y-2">
                          {["Over", "Under"].map((option, optionIndex) => (
                            <li key={optionIndex} className="flex items-center space-x-4">
                              <span className="text-sm font-medium text-gray-700 w-20">{option}</span>
                              <input
                                type="number"
                                name="points"
                                placeholder="Points"
                                className="w-24 px-4 py-2 border border-gray-300 rounded-md"
                                onChange={(e) => handleOverUnderPointsChange(e, questionIndex, optionIndex, option)}
                                min="0"
                                step="0.5"
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 py-2">
                      Select an NFL game above to enable player prop creation
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="flex justify-between items-center mt-8">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            type="button"
            onClick={handleAddQuestion}
          >
            Add Question
          </button>
          <button
            className="bg-green-500 text-white px-6 py-3 rounded-lg text-lg"
            type="submit"
          >
            {formId ? "Update Form" : "Create Form"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GameFormBuilder;
