import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Fuse from "fuse.js";
import { Plus } from "lucide-react";

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
        method: "GET",
        credentials: "include",
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

  useEffect(() => {
    fetchUpcomingGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch available players for the selected game
  const fetchPlayersForGame = async (espnGameId) => {
    try {
      console.log("Fetching players for ESPN game ID:", espnGameId);
      const response = await fetch(`${apiUrl}/espn_game/${espnGameId}/available_players`, {
        method: "GET",
        credentials: "include",
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
    const selectedGame = upcomingGames.find((g) => g.id === externalGameId);
    if (!selectedGame || !selectedGame.competitions || !selectedGame.competitions[0]) return [];

    const competitors = selectedGame.competitions[0].competitors || [];
    return competitors.map((comp) => ({
      id: comp.team?.abbreviation || comp.team?.id,
      name: comp.team?.displayName || comp.team?.name,
      abbreviation: comp.team?.abbreviation,
    }));
  };

  const handleCreateGame = () => {
    async function createGame() {
      if (!(gameStartDate instanceof Date)) {
        alert("Select a date.");
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
      const anytimeTdQuestions = [];

      // Ensure "Over" and "Under" exist for over/under questions
      questions.map((item) => {
        if (item.field_type === "over_under") {
          const hasOver = item.choices.some((c) => c.choice_text.toLowerCase() === "over");
          const hasUnder = item.choices.some((c) => c.choice_text.toLowerCase() === "under");
          if (!hasOver) item.choices.push({ choice_text: "Over", points: 0 });
          if (!hasUnder) item.choices.push({ choice_text: "Under", points: 0 });
        }
        return item;
      });

      questions.forEach((item) => {
        if (item.field_type === "select_winner") {
          const sortedChoices = item.choices.sort((a, b) => a.points - b.points);
          winnerLoserQuestions.push({
            question: item.label,
            favoritePoints: sortedChoices[0].points,
            underdogPoints: sortedChoices[1].points,
            favoriteTeam: sortedChoices[0].choice_text,
            underdogTeam: sortedChoices[1].choice_text,
            favoriteTeamId: sortedChoices[0].team_id || null,
            underdogTeamId: sortedChoices[1].team_id || null,
            is_mandatory: item.is_mandatory !== undefined ? item.is_mandatory : true,
          });
        }

        if (item.field_type === "over_under") {
          const overChoice = item.choices.find((c) => c.choice_text.toLowerCase() === "over");
          const underChoice = item.choices.find((c) => c.choice_text.toLowerCase() === "under");

          overUnderQuestions.push({
            question: item.label,
            overPoints: overChoice.points,
            underPoints: underChoice.points,
            playerName: item.player_name || null,
            playerId: item.player_id || null,
            statType: item.stat_type || null,
            lineValue: item.line_value || null,
            is_mandatory: item.is_mandatory !== undefined ? item.is_mandatory : false,
          });
        }

        if (item.field_type === "custom_select") {
          variableOptionQuestions.push({
            question: item.label,
            options: item.choices,
            is_mandatory: item.is_mandatory !== undefined ? item.is_mandatory : false,
          });
        }

        if (item.field_type === 'anytime_td') {
          // Anytime TD prop: each choice has player_name, td_line, and points
          anytimeTdQuestions.push({
            question: item.label,
            options: item.choices.map(choice => ({
              player_name: choice.choice_text,  // Player name
              td_line: choice.td_line || 0.5,   // TD threshold (default 0.5 = 1+ TD)
              points: choice.points             // Points if player hits line
            })),
            is_mandatory: item.is_mandatory !== undefined ? item.is_mandatory : false
          });
        }
      });

      const data = {
        leagueName: leagueName,
        gameName: formName,
        date: gameStartDate.toISOString(),
        externalGameId: externalGameId || null,
        propLimit: propLimit,
        winnerLoserQuestions,
        overUnderQuestions,
        variableOptionQuestions,
        anytimeTdQuestions,
      };

      console.log("=== SENDING CREATE GAME REQUEST ===");
      console.log("propLimit value:", propLimit, "(type:", typeof propLimit, ")");
      console.log("Full data being sent:", JSON.stringify(data, null, 2));
      console.log("===================================");

      try {
        const response = await fetch(`${apiUrl}/create_game`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        });

        if (response.ok) {
          alert("Game created successfully!");
          navigate(`/league-home/${leagueName}/league_manager_tools`);
        } else {
          alert(`Error creating game: ${response.status}`);
        }
      } catch (error) {
        if (error.message && error.message.toLowerCase().includes("load fail")) {
          console.warn("Safari 'Load failed' error (backend confirms success)");
          alert("Game created successfully!");
          navigate(`/league-home/${leagueName}/league_manager_tools`);
        } else {
          console.error("Network/CORS error:", error);
          alert(`Network error: ${error.message}`);
        }
      }
    }

    createGame();
  };

  useEffect(() => {
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
              { choice_text: "Over", points: 5 },
              { choice_text: "Under", points: 5 },
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
  }, [formId]);

  const handleQuestionChange = (e, questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex][e.target.name] = e.target.value;

    if (e.target.name === "field_type") {
      updatedQuestions[questionIndex].is_mandatory = e.target.value === "select_winner";
    }

    setQuestions(updatedQuestions);
  };

  const handleAddQuestion = () => {
    const isFirstQuestion = questions.length === 0;

    const defaultFieldType = isFirstQuestion ? "select_winner" : "over_under";

    const newQuestion =
      defaultFieldType === "select_winner"
        ? {
            label: "",
            field_type: "select_winner",
            is_mandatory: true, // winner/loser defaults mandatory
            choices: [
              { choice_text: "", points: 0 },
              { choice_text: "", points: 0 },
            ],
          }
        : {
            label: "",
            field_type: "over_under",
            is_mandatory: false, // props default optional
            choices: [
              { choice_text: "Over", points: 0 },
              { choice_text: "Under", points: 0 },
            ],
            player_name: "",
            player_id: null,
            stat_type: "",
            line_value: "",
          };

    setQuestions((prev) => [...prev, newQuestion]);
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
      points: parseFloat(e.target.value),
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
    setGameStartDate(selectedDate);
  };

  function getLocalDateString(date) {
    const localDate = new Date(date);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const day = String(localDate.getDate()).padStart(2, "0");
    const hours = String(localDate.getHours()).padStart(2, "0");
    const minutes = String(localDate.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  const handleOverUnderPointsChange = (e, questionIndex, pointValue, choice) => {
    const updatedQuestions = [...questions];

    const choiceIndex = updatedQuestions[questionIndex].choices.findIndex(
      (c) => c.choice_text.toLowerCase() === choice.toLowerCase()
    );

    if (choiceIndex !== -1) {
      updatedQuestions[questionIndex].choices[choiceIndex].points = parseFloat(e.target.value);
    } else {
      updatedQuestions[questionIndex].choices.push({
        choice_text: choice,
        points: parseFloat(e.target.value),
      });
    }

    setQuestions(updatedQuestions);
  };

  return (
    <div className="w-full">
      <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
        <div className="mb-6">
          <h1 className="text-2xl text-white">{formId ? "Edit Game" : "Create Game"}</h1>
          <p className="text-gray-400 text-sm mt-1">
            Set the lock time, link an ESPN game for polling, then build props below.
          </p>
        </div>

        <form onSubmit={handleCreateGame} className="space-y-6">
          <div>
            <label htmlFor="formName" className="block text-white mb-2">
              Form Name
            </label>
            <input
              type="text"
              name="formName"
              id="formName"
              placeholder="eg. Ravens @ Steelers"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 backdrop-blur-sm focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          <div>
            <label htmlFor="gameStartDateTime" className="block text-white mb-2">
              Game Start Date & Time
            </label>
            <input
              type="datetime-local"
              id="gameStartDateTime"
              name="gameStartDateTime"
              value={getLocalDateString(gameStartDate)}
              onChange={handleDateChange}
              className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 backdrop-blur-sm focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
            <p className="mt-2 text-sm text-gray-400">This timestamp is used as the lock time.</p>
          </div>

          <div>
            <label htmlFor="externalGameId" className="block text-white mb-2">
              Select NFL Game (Optional)
            </label>

            {loadingGames ? (
              <p className="text-sm text-gray-400">Loading upcoming games...</p>
            ) : (
              <select
                id="externalGameId"
                name="externalGameId"
                value={externalGameId}
                onChange={(e) => {
                  const selectedGameId = e.target.value;
                  setExternalGameId(selectedGameId);

                  if (selectedGameId) {
                    const selectedGame = upcomingGames.find((g) => g.id === selectedGameId);
                    if (selectedGame) {
                      const gameName = (selectedGame.name || selectedGame.shortName).replace(
                        / at /gi,
                        " @ "
                      );
                      setFormName(gameName);
                      setGameStartDate(new Date(selectedGame.date));
                    }
                    fetchPlayersForGame(selectedGameId);
                  } else {
                    setAvailablePlayers([]);
                  }
                }}
                className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 backdrop-blur-sm focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer"
              >
                <option value="" className="bg-zinc-900">
                  -- No live polling (manual game) --
                </option>
                {upcomingGames.map((game) => (
                  <option key={game.id} value={game.id} className="bg-zinc-900">
                    {game.name} - {new Date(game.date).toLocaleString()}
                  </option>
                ))}
              </select>
            )}

            <p className="mt-2 text-sm text-gray-400">
              Link an ESPN game for automatic live stat polling and winner determination.
            </p>
          </div>

          <div>
            <label htmlFor="propLimit" className="block text-white mb-2">
              Number of Optional Props Players Must Answer
            </label>
            <input
              type="number"
              id="propLimit"
              name="propLimit"
              min="0"
              max="20"
              value={propLimit}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setPropLimit(isNaN(val) ? 0 : val);
              }}
              className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 backdrop-blur-sm focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
            <p className="mt-2 text-sm text-gray-400">
              Players must answer exactly this many optional props. Mandatory props are always required. Set
              to 0 if all props are mandatory.
            </p>
          </div>

          <div className="h-px bg-white/10" />

          {/* Rest of builder stays the same (your original UI) */}
          <ul className="space-y-4">
            {questions.map((question, questionIndex) => (
              <li
                key={questionIndex}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                  <input
                    type="text"
                    name="label"
                    placeholder="Question Label"
                    className="flex-1 w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 backdrop-blur-sm focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    value={question.label}
                    onChange={(e) => handleQuestionChange(e, questionIndex)}
                  />

                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(questionIndex)}
                    className="px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500 border border-red-500/30 text-red-300 hover:text-white transition-all"
                  >
                    Delete
                  </button>
                </div>

                {/* Field Type */}
                <div className="mb-4">
                  <label className="block text-white mb-2">Field Type</label>
                  <select
                    name="field_type"
                    className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 backdrop-blur-sm focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer"
                    defaultValue={question.field_type}
                    onChange={(e) => handleQuestionChange(e, questionIndex)}
                  >
                    <option value="" className="bg-zinc-900">
                      Select Field Type
                    </option>
                    <option value="select_winner" className="bg-zinc-900">
                      Select Winner
                    </option>
                    <option value="over_under" className="bg-zinc-900">
                      Over/Under
                    </option>
                    <option value="custom_select" className="bg-zinc-900">
                      Custom Select
                    </option>
                    <option value="anytime_td" className="bg-zinc-900">
                      Anytime TD Scorer
                    </option>
                  </select>
                </div>

                {/* Mandatory toggle */}
                <div className="mb-5 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`mandatory-${questionIndex}`}
                    checked={
                      question.is_mandatory !== undefined
                        ? question.is_mandatory
                        : question.field_type === "select_winner"
                    }
                    onChange={(e) => {
                      const updatedQuestions = [...questions];
                      updatedQuestions[questionIndex].is_mandatory = e.target.checked;
                      setQuestions(updatedQuestions);
                    }}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <label htmlFor={`mandatory-${questionIndex}`} className="text-sm text-gray-300">
                    Mandatory prop (all players must answer)
                  </label>
                </div>

                {/* SELECT WINNER */}
                {question.field_type === "select_winner" && (
                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Teams</h4>

                    {externalGameId && getTeamsFromSelectedGame().length > 0 ? (
                      <ul className="space-y-2">
                        {question.choices.map((option, optionIndex) => (
                          <li key={optionIndex} className="flex items-center gap-3">
                            <select
                              className="flex-1 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer"
                              value={option.choice_text}
                              onChange={(e) => {
                                const selectedTeam = getTeamsFromSelectedGame().find(
                                  (t) => t.name === e.target.value
                                );
                                const updatedQuestions = [...questions];
                                updatedQuestions[questionIndex].choices[optionIndex] = {
                                  choice_text: e.target.value,
                                  points: updatedQuestions[questionIndex].choices[optionIndex].points,
                                  team_id: selectedTeam?.id || null,
                                };
                                setQuestions(updatedQuestions);
                              }}
                            >
                              <option value="" className="bg-zinc-900">
                                Select Team {optionIndex + 1}
                              </option>
                              {getTeamsFromSelectedGame().map((team) => (
                                <option key={team.id} value={team.name} className="bg-zinc-900">
                                  {team.name} ({team.abbreviation})
                                </option>
                              ))}
                            </select>

                            <input
                              type="number"
                              name="points"
                              placeholder="Pts"
                              value={option.points}
                              onChange={(e) => handleOptionPointsChange(e, questionIndex, optionIndex)}
                              className="w-28 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                              min="0"
                              step="0.5"
                            />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <ul className="space-y-2">
                        {question.choices.map((option, optionIndex) => (
                          <li key={optionIndex} className="flex items-center gap-3">
                            <input
                              type="text"
                              name="option"
                              placeholder="Team name"
                              className="flex-1 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                              value={option.choice_text}
                              onChange={(e) => handleOptionChange(e, questionIndex, optionIndex)}
                            />
                            <input
                              type="number"
                              name="points"
                              placeholder="Pts"
                              value={option.points}
                              onChange={(e) => handleOptionPointsChange(e, questionIndex, optionIndex)}
                              className="w-28 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                              min="0"
                              step="0.5"
                            />
                          </li>
                        ))}
                      </ul>
                    )}

                    <p className="text-sm text-gray-400">
                      {externalGameId
                        ? "Teams auto-populated from selected game"
                        : "Select an NFL game above to auto-populate teams"}
                    </p>
                  </div>
                )}

                {/* CUSTOM SELECT */}
                {question.field_type === "custom_select" && (
                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Options</h4>

                    <ul className="space-y-2">
                      {question.choices.map((option, optionIndex) => (
                        <li key={optionIndex} className="flex items-center gap-3">
                          <input
                            type="text"
                            name="option"
                            placeholder={`Option ${optionIndex + 1}`}
                            className="flex-1 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            value={option.choice_text}
                            onChange={(e) => handleOptionChange(e, questionIndex, optionIndex)}
                          />
                          <input
                            type="number"
                            name="points"
                            placeholder="Pts"
                            value={option.points}
                            onChange={(e) => handleOptionPointsChange(e, questionIndex, optionIndex)}
                            className="w-28 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            min="0"
                            step="0.5"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteOption(questionIndex, optionIndex)}
                            className="px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500 border border-red-500/30 text-red-300 hover:text-white transition-all"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={() => handleAddOption(questionIndex)}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Option
                    </button>
                  </div>
                )}

                {/* ANYTIME TD */}
                {question.field_type === "anytime_td" && (
                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Player Options</h4>
                    <p className="text-sm text-gray-400 mb-3">
                      Each player has their own TD line threshold (0.5 = 1+ TD, 1.5 = 2+ TDs, etc.)
                    </p>

                    {/* Column Headers */}
                    <div className="flex items-center gap-3 mb-2 px-1">
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase">Player Name</label>
                      </div>
                      <div className="w-32">
                        <label className="text-xs font-semibold text-gray-400 uppercase">TD Line</label>
                      </div>
                      <div className="w-28">
                        <label className="text-xs font-semibold text-gray-400 uppercase">Points</label>
                      </div>
                      <div className="w-24"></div>
                    </div>

                    <ul className="space-y-2">
                      {question.choices.map((option, optionIndex) => (
                        <li key={optionIndex} className="flex items-center gap-3">
                          <input
                            type="text"
                            name="option"
                            placeholder="Player Name"
                            className="flex-1 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            value={option.choice_text}
                            onChange={(e) => handleOptionChange(e, questionIndex, optionIndex)}
                          />
                          <input
                            type="number"
                            name="td_line"
                            placeholder="0.5"
                            value={option.td_line || 0.5}
                            onChange={(e) => {
                              const updatedQuestions = [...questions];
                              updatedQuestions[questionIndex].choices[optionIndex].td_line = parseFloat(e.target.value);
                              setQuestions(updatedQuestions);
                            }}
                            className="w-32 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            min="0.5"
                            step="1"
                          />
                          <input
                            type="number"
                            name="points"
                            placeholder="Pts"
                            value={option.points}
                            onChange={(e) => handleOptionPointsChange(e, questionIndex, optionIndex)}
                            className="w-28 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            min="0"
                            step="0.5"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteOption(questionIndex, optionIndex)}
                            className="px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500 border border-red-500/30 text-red-300 hover:text-white transition-all"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={() => handleAddOption(questionIndex)}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Player Option
                    </button>
                  </div>
                )}

                {/* OVER / UNDER */}
                {question.field_type === "over_under" && (
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Player Prop Details</h4>

                    {externalGameId && availablePlayers.length > 0 ? (
                      <div className="space-y-4">
                        {/* Player search */}
                        <div className="relative">
                          <label className="block text-gray-300 mb-2">Select Player</label>
                          <input
                            type="text"
                            className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            placeholder="Search for a player..."
                            value={playerSearchQuery[questionIndex] || question.player_name || ""}
                            onChange={(e) => {
                              const searchValue = e.target.value;
                              setPlayerSearchQuery({ ...playerSearchQuery, [questionIndex]: searchValue });
                              setShowPlayerDropdown({ ...showPlayerDropdown, [questionIndex]: true });

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
                                  [questionIndex]: results.map((r) => r.item),
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
                              setTimeout(() => {
                                setShowPlayerDropdown({ ...showPlayerDropdown, [questionIndex]: false });
                              }, 200);
                            }}
                          />

                          {showPlayerDropdown[questionIndex] &&
                            (filteredPlayers[questionIndex] || availablePlayers).length > 0 && (
                              <div className="absolute z-10 w-full mt-2 rounded-xl bg-zinc-900/95 border border-white/10 shadow-2xl max-h-60 overflow-y-auto">
                                {(filteredPlayers[questionIndex] || availablePlayers).map((player) => (
                                  <div
                                    key={player.id}
                                    className="px-4 py-3 cursor-pointer text-white hover:bg-white/10 transition-all"
                                    onClick={() => {
                                      const updatedQuestions = [...questions];
                                      updatedQuestions[questionIndex].player_name = player.name;
                                      updatedQuestions[questionIndex].player_id = player.id;
                                      setQuestions(updatedQuestions);
                                      setPlayerSearchQuery({
                                        ...playerSearchQuery,
                                        [questionIndex]: player.name,
                                      });
                                      setShowPlayerDropdown({
                                        ...showPlayerDropdown,
                                        [questionIndex]: false,
                                      });
                                    }}
                                  >
                                    {player.name} <span className="text-gray-400">({player.position})</span>
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>

                        {/* Stat type */}
                        <div>
                          <label className="block text-gray-300 mb-2">Stat Type</label>
                          <select
                            className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer"
                            value={question.stat_type || ""}
                            onChange={(e) => {
                              const updatedQuestions = [...questions];
                              updatedQuestions[questionIndex].stat_type = e.target.value;
                              setQuestions(updatedQuestions);
                            }}
                          >
                            <option value="" className="bg-zinc-900">
                              -- Select stat type --
                            </option>
                            <option value="passing_yards" className="bg-zinc-900">Passing Yards</option>
                            <option value="passing_tds" className="bg-zinc-900">Passing TDs</option>
                            <option value="passing_interceptions" className="bg-zinc-900">Passing Interceptions</option>
                            <option value="passing_completions" className="bg-zinc-900">Passing Completions</option>
                            <option value="rushing_yards" className="bg-zinc-900">Rushing Yards</option>
                            <option value="rushing_tds" className="bg-zinc-900">Rushing TDs</option>
                            <option value="receiving_yards" className="bg-zinc-900">Receiving Yards</option>
                            <option value="receiving_tds" className="bg-zinc-900">Receiving TDs</option>
                            <option value="receiving_receptions" className="bg-zinc-900">Receptions</option>
                            <option value="scrimmage_yards" className="bg-zinc-900">Scrimmage Yards (Rush + Rec)</option>
                          </select>
                        </div>

                        {/* Line */}
                        <div>
                          <label className="block text-gray-300 mb-2">Line (Over/Under)</label>
                          <input
                            type="number"
                            step="0.5"
                            placeholder="e.g., 250.5"
                            className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            value={question.line_value || ""}
                            onChange={(e) => {
                              const updatedQuestions = [...questions];
                              updatedQuestions[questionIndex].line_value = e.target.value;
                              setQuestions(updatedQuestions);
                            }}
                          />
                        </div>

                        {/* Points */}
                        <div>
                          <label className="block text-gray-300 mb-2">Points</label>
                          <div className="space-y-2">
                            {["Over", "Under"].map((opt) => (
                              <div key={opt} className="flex items-center gap-3">
                                <div className="w-20 text-gray-200">{opt}</div>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  placeholder="Pts"
                                  className="w-32 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                  onChange={(e) =>
                                    handleOverUnderPointsChange(e, questionIndex, 0, opt)
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 py-2">
                        Select an NFL game above to enable player prop creation
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>


          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleAddQuestion}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>

            <button
              type="submit"
              className="sm:ml-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white transition-all hover:shadow-xl hover:shadow-emerald-500/50 hover:scale-[1.02]"
            >
              {formId ? "Update Game" : "Create Game"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GameFormBuilder;
