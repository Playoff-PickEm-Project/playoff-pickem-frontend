import React, { useEffect, useState } from "react";
import { getUsername } from "../App";
import { useNavigate, useParams } from "react-router-dom";
import Fuse from "fuse.js";

const EditGameForm = () => {
    const [isCommissioner, setIsCommissioner] = useState(false);
    const { leagueName, gameId } = useParams();
    const [league, setLeague] = useState({});
    const [gameName, setGameName] = useState("");
    const [gameStartDate, setGameStartDate] = useState(new Date().toISOString());
    const [propLimit, setPropLimit] = useState(2); // How many optional props players must select
    const [externalGameId, setExternalGameId] = useState("");
    const [winnerLoserProps, setWinnerLoserProps] = useState([]);
    const [overUnderProps, setOverUnderProps] = useState([]);
    const [variableOptionProps, setVariableOptionProps] = useState([]);
    const [anytimeTdProps, setAnytimeTdProps] = useState([]);
    const [editingProps, setEditingProps] = useState({});

    // ESPN API states
    const [upcomingGames, setUpcomingGames] = useState([]);
    const [loadingGames, setLoadingGames] = useState(false);
    const [availablePlayers, setAvailablePlayers] = useState([]);
    const [playerSearchQuery, setPlayerSearchQuery] = useState({});
    const [filteredPlayers, setFilteredPlayers] = useState({});
    const [showPlayerDropdown, setShowPlayerDropdown] = useState({});

    // Track changes
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const username = getUsername();
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

    useEffect(() => {
        fetchUpcomingGames();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const leagueResponse = await fetch(`${apiUrl}/get_league_by_name?leagueName=${leagueName}`);
                const leagueData = await leagueResponse.json();
                setLeague(leagueData);

                const userResponse = await fetch(`${apiUrl}/get_user_by_username?username=${encodeURIComponent(username)}`);
                const userData = await userResponse.json();

                if (leagueData.commissioner.user_id === userData.id) {
                    setIsCommissioner(true);
                } else {
                    navigate(`/league-home/${leagueName}`);
                }
            } catch (error) {
                console.error(error);
                alert("Something went wrong");
            }
        };
        fetchData();
    }, [leagueName, username, navigate, apiUrl]);

    useEffect(() => {
        fetch(`${apiUrl}/get_game_by_id?game_id=${gameId}`)
            .then((res) => res.json())
            .then((data) => {
                setGameName(data.game_name);
                setGameStartDate(new Date(data.start_time));
                setPropLimit(data.prop_limit ?? 2);
                setExternalGameId(data.external_game_id || "");
                setWinnerLoserProps(data.winner_loser_props || []);
                setOverUnderProps(data.over_under_props || []);
                setVariableOptionProps(data.variable_option_props || []);
                setAnytimeTdProps(data.anytime_td_props || []);

                // Fetch players if external game is set
                if (data.external_game_id) {
                    fetchPlayersForGame(data.external_game_id);
                }
            })
            .catch((err) => console.error(err));
    }, [gameId, apiUrl]);

    const toggleEditing = (propId) => {
        setEditingProps((prev) => ({
            ...prev,
            [propId]: !prev[propId],
        }));
    };

    const handleInputChange = (propId, key, value, type) => {
        setHasUnsavedChanges(true);
        if (type === "winnerLoser") {
            setWinnerLoserProps((prev) =>
                prev.map((prop) =>
                    prop.prop_id === propId ? { ...prop, [key]: value } : prop
                )
            );
        } else if (type === "overUnder") {
            setOverUnderProps((prev) =>
                prev.map((prop) =>
                    prop.prop_id === propId ? { ...prop, [key]: value } : prop
                )
            );
        } else if (type === "variableOption") {
            setVariableOptionProps((prev) =>
                prev.map((prop) =>
                    prop.prop_id === propId ? { ...prop, [key]: value } : prop
                )
            );
        } else if (type === "anytimeTd") {
            setAnytimeTdProps((prev) =>
                prev.map((prop) =>
                    prop.prop_id === propId ? { ...prop, [key]: value } : prop
                )
            );
        }
    };

    const handleSaveProp = (propId, type) => {
        // Just close the editing mode, changes are tracked in state
        toggleEditing(propId);
    };

    const handleDeleteProp = (propId, propType) => {
        setHasUnsavedChanges(true);
        // Mark for deletion in local state
        if (propType === "winner_loser") {
            setWinnerLoserProps(prev => prev.filter(p => p.prop_id !== propId));
        } else if (propType === "over_under") {
            setOverUnderProps(prev => prev.filter(p => p.prop_id !== propId));
        } else if (propType === "variable_option") {
            setVariableOptionProps(prev => prev.filter(p => p.prop_id !== propId));
        } else if (propType === "anytime_td") {
            setAnytimeTdProps(prev => prev.filter(p => p.prop_id !== propId));
        }
    };

    const handleAddWinnerLoserProp = () => {
        setHasUnsavedChanges(true);
        const teams = getTeamsFromSelectedGame();
        const newPropId = `temp_wl_${Date.now()}`;
        const newProp = {
            prop_id: newPropId, // Temporary ID for new props
            game_id: gameId,
            question: "Who will win?",
            favorite_team: teams.length > 0 ? teams[0].name : "Team A",
            underdog_team: teams.length > 1 ? teams[1].name : "Team B",
            favorite_points: 1,
            underdog_points: 1,
            is_mandatory: true, // Winner/Loser defaults to mandatory
            isNew: true, // Flag to identify new props
        };
        setWinnerLoserProps(prev => [...prev, newProp]);
        // Auto-expand the new prop for editing
        setEditingProps(prev => ({ ...prev, [newPropId]: true }));
    };

    const handleAddOverUnderProp = () => {
        setHasUnsavedChanges(true);
        const newPropId = `temp_ou_${Date.now()}`;
        const newProp = {
            prop_id: newPropId,
            game_id: gameId,
            question: "Over/Under question?",
            over_points: 1,
            under_points: 1,
            line_value: 0,
            is_mandatory: false, // Over/Under defaults to optional
            isNew: true,
        };
        setOverUnderProps(prev => [...prev, newProp]);
        // Auto-expand the new prop for editing
        setEditingProps(prev => ({ ...prev, [newPropId]: true }));
    };

    const handleAddRandomProp = () => {
        setHasUnsavedChanges(true);
        const newPropId = `temp_vo_${Date.now()}`;
        const newProp = {
            prop_id: newPropId,
            game_id: gameId,
            question: "Random question?",
            options: [
                { answer_choice: "Option A", answer_points: 1 },
                { answer_choice: "Option B", answer_points: 1 },
            ],
            is_mandatory: false, // Variable Option defaults to optional
            isNew: true,
        };
        setVariableOptionProps(prev => [...prev, newProp]);
        // Auto-expand the new prop for editing
        setEditingProps(prev => ({ ...prev, [newPropId]: true }));
    };

    const handleAddAnytimeTdProp = () => {
        setHasUnsavedChanges(true);
        const newPropId = `temp_td_${Date.now()}`;
        const newProp = {
            prop_id: newPropId,
            game_id: gameId,
            question: "Which player will score touchdowns?",
            options: [
                { player_name: "Player 1", td_line: 0.5, points: 1 },
                { player_name: "Player 2", td_line: 0.5, points: 1 },
            ],
            is_mandatory: false, // Anytime TD defaults to optional
            isNew: true,
        };
        setAnytimeTdProps(prev => [...prev, newProp]);
        // Auto-expand the new prop for editing
        setEditingProps(prev => ({ ...prev, [newPropId]: true }));
    };

    const handleSaveAllChanges = async () => {
        if (!hasUnsavedChanges) return;

        if (!window.confirm("Save all changes to this game?")) {
            return;
        }

        setIsSaving(true);

        try {
            // First, update game metadata (name, start_time, external_game_id)
            await fetch(`${apiUrl}/update_game`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    game_id: gameId,
                    game_name: gameName,
                    start_time: typeof gameStartDate === 'string' ? gameStartDate : gameStartDate.toISOString(),
                    prop_limit: propLimit,
                    external_game_id: externalGameId || null,
                }),
            });

            // Process all props: add new ones, update existing ones
            const promises = [];

            // Winner/Loser Props
            for (const prop of winnerLoserProps) {
                if (prop.isNew) {
                    const { prop_id, isNew, ...propData } = prop;
                    promises.push(
                        fetch(`${apiUrl}/add_winner_loser_prop`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify(propData),
                        })
                    );
                } else {
                    promises.push(
                        fetch(`${apiUrl}/update_winner_loser_prop`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify(prop),
                        })
                    );
                }
            }

            // Over/Under Props
            for (const prop of overUnderProps) {
                if (prop.isNew) {
                    const { prop_id, isNew, ...propData } = prop;
                    promises.push(
                        fetch(`${apiUrl}/add_over_under_prop`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify(propData),
                        })
                    );
                } else {
                    promises.push(
                        fetch(`${apiUrl}/update_over_under_prop`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify(prop),
                        })
                    );
                }
            }

            // Variable Option Props
            for (const prop of variableOptionProps) {
                if (prop.isNew) {
                    const { prop_id, isNew, ...propData } = prop;
                    promises.push(
                        fetch(`${apiUrl}/add_variable_option_prop`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify(propData),
                        })
                    );
                } else {
                    promises.push(
                        fetch(`${apiUrl}/update_variable_option_prop`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify(prop),
                        })
                    );
                }
            }

            // Anytime TD Props
            for (const prop of anytimeTdProps) {
                if (prop.isNew) {
                    const { prop_id, isNew, ...propData } = prop;
                    promises.push(
                        fetch(`${apiUrl}/add_anytime_td_prop`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify(propData),
                        })
                    );
                } else {
                    promises.push(
                        fetch(`${apiUrl}/update_anytime_td_prop`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify(prop),
                        })
                    );
                }
            }

            // Execute all saves in parallel
            await Promise.all(promises);

            // Refresh game data to get updated state
            const gameResponse = await fetch(`${apiUrl}/get_game_by_id?game_id=${gameId}`);
            const gameData = await gameResponse.json();
            setGameName(gameData.game_name);
            setGameStartDate(new Date(gameData.start_time));
            setExternalGameId(gameData.external_game_id || "");
            setWinnerLoserProps(gameData.winner_loser_props || []);
            setOverUnderProps(gameData.over_under_props || []);
            setVariableOptionProps(gameData.variable_option_props || []);
            setAnytimeTdProps(gameData.anytime_td_props || []);

            setHasUnsavedChanges(false);
            alert("Game saved successfully!");
        } catch (error) {
            console.error("Error saving game:", error);
            alert("Failed to save game. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDiscardChanges = async () => {
        if (!window.confirm("Are you sure you want to discard all changes?")) {
            return;
        }

        // Reload game data from server
        try {
            const gameResponse = await fetch(`${apiUrl}/get_game_by_id?game_id=${gameId}`);
            const gameData = await gameResponse.json();
            setGameName(gameData.game_name);
            setGameStartDate(new Date(gameData.start_time));
            setExternalGameId(gameData.external_game_id || "");
            setWinnerLoserProps(gameData.winner_loser_props || []);
            setOverUnderProps(gameData.over_under_props || []);
            setVariableOptionProps(gameData.variable_option_props || []);
            setAnytimeTdProps(gameData.anytime_td_props || []);
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error("Error reloading game:", error);
        }
    };

    const handleDeleteGame = async (event) => {
        event.preventDefault();

        if (!window.confirm("Are you sure you want to delete this entire game? This cannot be undone.")) {
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/delete_game`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ game_id: gameId, leaguename: leagueName }),
            });

            if (!response.ok) {
                alert("Game could not be deleted. Try again.");
            } else {
                alert("Game was deleted.");
                navigate(`/league-home/${leagueName}/viewGames`);
            }
        } catch (error) {
            alert("Endpoint not reached");
        }
    };

    function getLocalDateString(date) {
        const localDate = new Date(date);
        const year = localDate.getFullYear();
        const month = String(localDate.getMonth() + 1).padStart(2, '0');
        const day = String(localDate.getDate()).padStart(2, '0');
        const hours = String(localDate.getHours()).padStart(2, '0');
        const minutes = String(localDate.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    return (
        <div className="min-h-screen bg-zinc-950 p-6">
            <div className="max-w-5xl mx-auto">
                <h3 className="text-3xl font-bold text-white mb-6">Edit Game: {gameName}</h3>

                {!isCommissioner && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                        <p className="text-red-400">
                            You do not have permission to edit this game
                        </p>
                    </div>
                )}

                {isCommissioner && (
                    <>
                        {/* ESPN Game Selection */}
                        <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
                            <h4 className="text-xl font-semibold text-white mb-4">ESPN Game Settings</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">
                                        Select NFL Game (Optional - for live polling)
                                    </label>
                                    {loadingGames ? (
                                        <p className="text-sm text-gray-500">Loading upcoming games...</p>
                                    ) : (
                                        <select
                                            className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                                            value={externalGameId}
                                            onChange={(e) => {
                                                const selectedGameId = e.target.value;
                                                setHasUnsavedChanges(true);
                                                setExternalGameId(selectedGameId);

                                                if (selectedGameId) {
                                                    const selectedGame = upcomingGames.find(g => g.id === selectedGameId);
                                                    if (selectedGame) {
                                                        const newGameName = (selectedGame.name || selectedGame.shortName).replace(/ at /gi, ' @ ');
                                                        setGameName(newGameName);
                                                        setGameStartDate(new Date(selectedGame.date));
                                                    }
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
                                        Select an upcoming NFL game for automatic live stat polling
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Game Name</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                                        value={gameName}
                                        onChange={(e) => {
                                            setHasUnsavedChanges(true);
                                            setGameName(e.target.value);
                                        }}
                                        placeholder="Enter game name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Game Start Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                                        value={getLocalDateString(gameStartDate)}
                                        onChange={(e) => {
                                            setHasUnsavedChanges(true);
                                            setGameStartDate(new Date(e.target.value));
                                        }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">
                                        Optional Props to Select
                                        <span className="text-xs text-gray-500 ml-2">(How many optional props must players choose?)</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                                        value={propLimit}
                                        onChange={(e) => {
                                            setHasUnsavedChanges(true);
                                            const val = parseInt(e.target.value);
                                            setPropLimit(isNaN(val) ? 2 : val);
                                        }}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Players will select {propLimit} props from the optional pool (mandatory props are always required)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Add Prop Buttons */}
                        <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
                            <h4 className="text-xl font-semibold text-white mb-4">Add New Props</h4>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={handleAddWinnerLoserProp}
                                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition"
                                    type="button"
                                >
                                    + Add Winner/Loser Prop
                                </button>
                                <button
                                    onClick={handleAddOverUnderProp}
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                                    type="button"
                                >
                                    + Add Over/Under Prop
                                </button>
                                <button
                                    onClick={handleAddRandomProp}
                                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition"
                                    type="button"
                                >
                                    + Add Random Prop
                                </button>
                                <button
                                    onClick={handleAddAnytimeTdProp}
                                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition"
                                    type="button"
                                >
                                    + Add Anytime TD Prop
                                </button>
                            </div>
                        </div>

                        {/* Winner-Loser Props */}
                        <div className="mb-8">
                            <h4 className="text-2xl font-semibold text-white mb-4">Winner/Loser Props</h4>
                            {winnerLoserProps.length === 0 ? (
                                <p className="text-gray-400">No Winner/Loser props yet.</p>
                            ) : (
                                winnerLoserProps.map((prop) => (
                                    <div
                                        key={prop.prop_id}
                                        className="bg-white/5 border border-white/10 rounded-lg p-6 mb-4"
                                    >
                                        {editingProps[prop.prop_id] ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm text-gray-400 mb-1">Question</label>
                                                    <input
                                                        type="text"
                                                        className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                                                        value={prop.question}
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                prop.prop_id,
                                                                "question",
                                                                e.target.value,
                                                                "winnerLoser"
                                                            )
                                                        }
                                                        placeholder="Enter question"
                                                    />
                                                </div>

                                                {externalGameId && getTeamsFromSelectedGame().length > 0 ? (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm text-gray-400 mb-1">Favorite Team</label>
                                                            <select
                                                                className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                                                                value={prop.favorite_team}
                                                                onChange={(e) =>
                                                                    handleInputChange(
                                                                        prop.prop_id,
                                                                        "favorite_team",
                                                                        e.target.value,
                                                                        "winnerLoser"
                                                                    )
                                                                }
                                                            >
                                                                {getTeamsFromSelectedGame().map((team) => (
                                                                    <option key={team.id} value={team.name}>
                                                                        {team.name} ({team.abbreviation})
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm text-gray-400 mb-1">Favorite Points</label>
                                                            <input
                                                                type="number"
                                                                className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                                                                value={prop.favorite_points}
                                                                onChange={(e) =>
                                                                    handleInputChange(
                                                                        prop.prop_id,
                                                                        "favorite_points",
                                                                        e.target.value,
                                                                        "winnerLoser"
                                                                    )
                                                                }
                                                                step={0.5}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm text-gray-400 mb-1">Underdog Team</label>
                                                            <select
                                                                className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                                                                value={prop.underdog_team}
                                                                onChange={(e) =>
                                                                    handleInputChange(
                                                                        prop.prop_id,
                                                                        "underdog_team",
                                                                        e.target.value,
                                                                        "winnerLoser"
                                                                    )
                                                                }
                                                            >
                                                                {getTeamsFromSelectedGame().map((team) => (
                                                                    <option key={team.id} value={team.name}>
                                                                        {team.name} ({team.abbreviation})
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm text-gray-400 mb-1">Underdog Points</label>
                                                            <input
                                                                type="number"
                                                                className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                                                                value={prop.underdog_points}
                                                                onChange={(e) =>
                                                                    handleInputChange(
                                                                        prop.prop_id,
                                                                        "underdog_points",
                                                                        e.target.value,
                                                                        "winnerLoser"
                                                                    )
                                                                }
                                                                step={0.5}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm text-gray-400 mb-1">Favorite Team</label>
                                                            <input
                                                                type="text"
                                                                className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                                                                value={prop.favorite_team}
                                                                onChange={(e) =>
                                                                    handleInputChange(
                                                                        prop.prop_id,
                                                                        "favorite_team",
                                                                        e.target.value,
                                                                        "winnerLoser"
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm text-gray-400 mb-1">Favorite Points</label>
                                                            <input
                                                                type="number"
                                                                className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                                                                value={prop.favorite_points}
                                                                onChange={(e) =>
                                                                    handleInputChange(
                                                                        prop.prop_id,
                                                                        "favorite_points",
                                                                        e.target.value,
                                                                        "winnerLoser"
                                                                    )
                                                                }
                                                                step={0.5}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm text-gray-400 mb-1">Underdog Team</label>
                                                            <input
                                                                type="text"
                                                                className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                                                                value={prop.underdog_team}
                                                                onChange={(e) =>
                                                                    handleInputChange(
                                                                        prop.prop_id,
                                                                        "underdog_team",
                                                                        e.target.value,
                                                                        "winnerLoser"
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm text-gray-400 mb-1">Underdog Points</label>
                                                            <input
                                                                type="number"
                                                                className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                                                                value={prop.underdog_points}
                                                                onChange={(e) =>
                                                                    handleInputChange(
                                                                        prop.prop_id,
                                                                        "underdog_points",
                                                                        e.target.value,
                                                                        "winnerLoser"
                                                                    )
                                                                }
                                                                step={0.5}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Mandatory Checkbox */}
                                                <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                                    <input
                                                        type="checkbox"
                                                        id={`mandatory-${prop.prop_id}`}
                                                        checked={prop.is_mandatory !== false}
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                prop.prop_id,
                                                                "is_mandatory",
                                                                e.target.checked,
                                                                "winnerLoser"
                                                            )
                                                        }
                                                        className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <label htmlFor={`mandatory-${prop.prop_id}`} className="text-sm text-gray-300 cursor-pointer">
                                                        Make this prop <span className="font-semibold text-blue-400">mandatory</span> (all players must answer)
                                                    </label>
                                                </div>

                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleSaveProp(prop.prop_id, "winnerLoser")}
                                                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
                                                    >
                                                        Done
                                                    </button>
                                                    <button
                                                        onClick={() => toggleEditing(prop.prop_id)}
                                                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <h5 className="text-lg font-semibold text-white">{prop.question}</h5>
                                                <div className="grid grid-cols-2 gap-4 text-gray-300">
                                                    <p>
                                                        <span className="font-bold text-emerald-400">{prop.favorite_team}:</span> {prop.favorite_points} pts
                                                    </p>
                                                    <p>
                                                        <span className="font-bold text-blue-400">{prop.underdog_team}:</span> {prop.underdog_points} pts
                                                    </p>
                                                </div>
                                                <div className="flex space-x-2 pt-2">
                                                    <button
                                                        onClick={() => toggleEditing(prop.prop_id)}
                                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProp(prop.prop_id, "winner_loser")}
                                                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Over-Under Props */}
                        <div className="mb-8">
                            <h4 className="text-2xl font-semibold text-white mb-4">Over/Under Props</h4>
                            {overUnderProps.length === 0 ? (
                                <p className="text-gray-400">No Over/Under props yet.</p>
                            ) : (
                                overUnderProps.map((prop) => (
                                    <div
                                        key={prop.prop_id}
                                        className="bg-white/5 border border-white/10 rounded-lg p-6 mb-4"
                                    >
                                        {editingProps[prop.prop_id] ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm text-gray-400 mb-1">Question</label>
                                                    <input
                                                        type="text"
                                                        className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                                                        value={prop.question}
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                prop.prop_id,
                                                                "question",
                                                                e.target.value,
                                                                "overUnder"
                                                            )
                                                        }
                                                        placeholder="Enter question"
                                                    />
                                                </div>

                                                {externalGameId && availablePlayers.length > 0 && (
                                                    <div className="space-y-3 bg-white/5 p-4 rounded-lg">
                                                        <h5 className="text-sm font-semibold text-white">ESPN Player Prop Settings</h5>

                                                        {/* Player Selection with Fuzzy Search */}
                                                        <div className="relative">
                                                            <label className="block text-sm text-gray-400 mb-1">Select Player</label>
                                                            <input
                                                                type="text"
                                                                className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                                                                placeholder="Search for a player..."
                                                                value={playerSearchQuery[prop.prop_id] || prop.player_name || ""}
                                                                onChange={(e) => {
                                                                    const searchValue = e.target.value;
                                                                    setPlayerSearchQuery({ ...playerSearchQuery, [prop.prop_id]: searchValue });
                                                                    setShowPlayerDropdown({ ...showPlayerDropdown, [prop.prop_id]: true });

                                                                    if (searchValue.trim() === "") {
                                                                        setFilteredPlayers({ ...filteredPlayers, [prop.prop_id]: availablePlayers });
                                                                    } else {
                                                                        const fuse = new Fuse(availablePlayers, {
                                                                            keys: ["name", "position"],
                                                                            threshold: 0.3,
                                                                        });
                                                                        const results = fuse.search(searchValue);
                                                                        setFilteredPlayers({
                                                                            ...filteredPlayers,
                                                                            [prop.prop_id]: results.map(r => r.item)
                                                                        });
                                                                    }
                                                                }}
                                                                onFocus={() => {
                                                                    setShowPlayerDropdown({ ...showPlayerDropdown, [prop.prop_id]: true });
                                                                    if (!filteredPlayers[prop.prop_id]) {
                                                                        setFilteredPlayers({ ...filteredPlayers, [prop.prop_id]: availablePlayers });
                                                                    }
                                                                }}
                                                                onBlur={() => {
                                                                    setTimeout(() => {
                                                                        setShowPlayerDropdown({ ...showPlayerDropdown, [prop.prop_id]: false });
                                                                    }, 200);
                                                                }}
                                                            />
                                                            {showPlayerDropdown[prop.prop_id] && (filteredPlayers[prop.prop_id] || availablePlayers).length > 0 && (
                                                                <div className="absolute z-10 w-full mt-1 bg-zinc-900 border border-white/10 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                                                    {(filteredPlayers[prop.prop_id] || availablePlayers).map((player) => (
                                                                        <div
                                                                            key={player.id}
                                                                            className="px-4 py-2 cursor-pointer hover:bg-white/10 text-white"
                                                                            onClick={() => {
                                                                                handleInputChange(prop.prop_id, "player_name", player.name, "overUnder");
                                                                                handleInputChange(prop.prop_id, "player_id", player.id, "overUnder");
                                                                                setPlayerSearchQuery({ ...playerSearchQuery, [prop.prop_id]: player.name });
                                                                                setShowPlayerDropdown({ ...showPlayerDropdown, [prop.prop_id]: false });
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
                                                            <label className="block text-sm text-gray-400 mb-1">Stat Type</label>
                                                            <select
                                                                className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                                                                value={prop.stat_type || ""}
                                                                onChange={(e) =>
                                                                    handleInputChange(
                                                                        prop.prop_id,
                                                                        "stat_type",
                                                                        e.target.value,
                                                                        "overUnder"
                                                                    )
                                                                }
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
                                                            <label className="block text-sm text-gray-400 mb-1">Line (Over/Under)</label>
                                                            <input
                                                                type="number"
                                                                step="0.5"
                                                                placeholder="e.g., 250.5"
                                                                className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                                                                value={prop.line_value || ""}
                                                                onChange={(e) =>
                                                                    handleInputChange(
                                                                        prop.prop_id,
                                                                        "line_value",
                                                                        e.target.value,
                                                                        "overUnder"
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm text-gray-400 mb-1">Over Points</label>
                                                        <input
                                                            type="number"
                                                            className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                                                            value={prop.over_points}
                                                            onChange={(e) =>
                                                                handleInputChange(
                                                                    prop.prop_id,
                                                                    "over_points",
                                                                    e.target.value,
                                                                    "overUnder"
                                                                )
                                                            }
                                                            step={0.5}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm text-gray-400 mb-1">Under Points</label>
                                                        <input
                                                            type="number"
                                                            className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                                                            value={prop.under_points}
                                                            onChange={(e) =>
                                                                handleInputChange(
                                                                    prop.prop_id,
                                                                    "under_points",
                                                                    e.target.value,
                                                                    "overUnder"
                                                                )
                                                            }
                                                            step={0.5}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Mandatory Checkbox */}
                                                <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                                    <input
                                                        type="checkbox"
                                                        id={`mandatory-ou-${prop.prop_id}`}
                                                        checked={prop.is_mandatory === true}
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                prop.prop_id,
                                                                "is_mandatory",
                                                                e.target.checked,
                                                                "overUnder"
                                                            )
                                                        }
                                                        className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <label htmlFor={`mandatory-ou-${prop.prop_id}`} className="text-sm text-gray-300 cursor-pointer">
                                                        Make this prop <span className="font-semibold text-blue-400">mandatory</span> (all players must answer)
                                                    </label>
                                                </div>

                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleSaveProp(prop.prop_id, "overUnder")}
                                                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
                                                    >
                                                        Done
                                                    </button>
                                                    <button
                                                        onClick={() => toggleEditing(prop.prop_id)}
                                                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <h5 className="text-lg font-semibold text-white">{prop.question}</h5>
                                                {prop.player_name && (
                                                    <p className="text-sm text-gray-400">
                                                        Player: {prop.player_name}
                                                        {prop.stat_type && ` | ${prop.stat_type.replace(/_/g, ' ')}`}
                                                        {prop.line_value && ` | Line: ${prop.line_value}`}
                                                    </p>
                                                )}
                                                <div className="grid grid-cols-2 gap-4 text-gray-300">
                                                    <p>
                                                        <span className="font-bold text-emerald-400">Over:</span> {prop.over_points} pts
                                                    </p>
                                                    <p>
                                                        <span className="font-bold text-blue-400">Under:</span> {prop.under_points} pts
                                                    </p>
                                                </div>
                                                <div className="flex space-x-2 pt-2">
                                                    <button
                                                        onClick={() => toggleEditing(prop.prop_id)}
                                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProp(prop.prop_id, "over_under")}
                                                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Variable Option Props */}
                        <div className="mb-8">
                            <h4 className="text-2xl font-semibold text-white mb-4">Random Props</h4>
                            {variableOptionProps.length === 0 ? (
                                <p className="text-gray-400">No Random props yet.</p>
                            ) : (
                                variableOptionProps.map((prop) => (
                                    <div
                                        key={prop.prop_id}
                                        className="bg-white/5 border border-white/10 rounded-lg p-6 mb-4"
                                    >
                                        {editingProps[prop.prop_id] ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm text-gray-400 mb-1">Question</label>
                                                    <input
                                                        type="text"
                                                        className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                                                        value={prop.question}
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                prop.prop_id,
                                                                "question",
                                                                e.target.value,
                                                                "variableOption"
                                                            )
                                                        }
                                                        placeholder="Enter question"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm text-gray-400 mb-2">Options</label>
                                                    {prop.options && prop.options.map((opt, idx) => (
                                                        <div key={idx} className="flex items-center space-x-2 mb-2">
                                                            <input
                                                                type="text"
                                                                className="flex-1 p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                                                                value={opt.answer_choice}
                                                                onChange={(e) => {
                                                                    const updatedOptions = [...prop.options];
                                                                    updatedOptions[idx] = { ...updatedOptions[idx], answer_choice: e.target.value };
                                                                    handleInputChange(
                                                                        prop.prop_id,
                                                                        "options",
                                                                        updatedOptions,
                                                                        "variableOption"
                                                                    );
                                                                }}
                                                                placeholder={`Option ${idx + 1}`}
                                                            />
                                                            <input
                                                                type="number"
                                                                className="w-24 p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                                                                value={opt.answer_points}
                                                                onChange={(e) => {
                                                                    const updatedOptions = [...prop.options];
                                                                    updatedOptions[idx] = { ...updatedOptions[idx], answer_points: parseFloat(e.target.value) };
                                                                    handleInputChange(
                                                                        prop.prop_id,
                                                                        "options",
                                                                        updatedOptions,
                                                                        "variableOption"
                                                                    );
                                                                }}
                                                                step={0.5}
                                                                placeholder="Points"
                                                            />
                                                            <button
                                                                type="button"
                                                                className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
                                                                onClick={() => {
                                                                    const updatedOptions = prop.options.filter((_, i) => i !== idx);
                                                                    handleInputChange(
                                                                        prop.prop_id,
                                                                        "options",
                                                                        updatedOptions,
                                                                        "variableOption"
                                                                    );
                                                                }}
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg mt-2"
                                                        onClick={() => {
                                                            const updatedOptions = [...(prop.options || []), { answer_choice: "", answer_points: 1 }];
                                                            handleInputChange(
                                                                prop.prop_id,
                                                                "options",
                                                                updatedOptions,
                                                                "variableOption"
                                                            );
                                                        }}
                                                    >
                                                        + Add Option
                                                    </button>
                                                </div>

                                                {/* Mandatory Checkbox */}
                                                <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                                    <input
                                                        type="checkbox"
                                                        id={`mandatory-vo-${prop.prop_id}`}
                                                        checked={prop.is_mandatory === true}
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                prop.prop_id,
                                                                "is_mandatory",
                                                                e.target.checked,
                                                                "variableOption"
                                                            )
                                                        }
                                                        className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <label htmlFor={`mandatory-vo-${prop.prop_id}`} className="text-sm text-gray-300 cursor-pointer">
                                                        Make this prop <span className="font-semibold text-blue-400">mandatory</span> (all players must answer)
                                                    </label>
                                                </div>

                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleSaveProp(prop.prop_id, "variableOption")}
                                                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
                                                    >
                                                        Done
                                                    </button>
                                                    <button
                                                        onClick={() => toggleEditing(prop.prop_id)}
                                                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <h5 className="text-lg font-semibold text-white">{prop.question}</h5>
                                                <div className="text-gray-300">
                                                    <p className="text-sm text-gray-400 mb-2">Options:</p>
                                                    {prop.options && prop.options.map((opt, idx) => (
                                                        <p key={idx}>• {opt.answer_choice} ({opt.answer_points} pts)</p>
                                                    ))}
                                                </div>
                                                <div className="flex space-x-2 pt-2">
                                                    <button
                                                        onClick={() => toggleEditing(prop.prop_id)}
                                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProp(prop.prop_id, "variable_option")}
                                                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Anytime TD Props */}
                        <div className="mb-8">
                            <h4 className="text-2xl font-semibold text-white mb-4">Anytime TD Props</h4>
                            {anytimeTdProps.length === 0 ? (
                                <p className="text-gray-400">No Anytime TD props yet.</p>
                            ) : (
                                anytimeTdProps.map((prop) => (
                                    <div
                                        key={prop.prop_id}
                                        className="bg-white/5 border border-white/10 rounded-lg p-6 mb-4"
                                    >
                                        {editingProps[prop.prop_id] ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm text-gray-400 mb-1">Question</label>
                                                    <input
                                                        type="text"
                                                        className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                                                        value={prop.question}
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                prop.prop_id,
                                                                "question",
                                                                e.target.value,
                                                                "anytimeTd"
                                                            )
                                                        }
                                                        placeholder="Enter question"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm text-gray-400 mb-2">Player Options (TD Lines)</label>
                                                    <p className="text-xs text-gray-500 mb-3">
                                                        TD Line: 0.5 = 1+ TD, 1.5 = 2+ TDs, 2.5 = 3+ TDs
                                                    </p>
                                                    {prop.options && prop.options.map((opt, idx) => (
                                                        <div key={idx} className="flex items-center space-x-2 mb-2">
                                                            <input
                                                                type="text"
                                                                className="flex-1 p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                                                                value={opt.player_name}
                                                                onChange={(e) => {
                                                                    const updatedOptions = [...prop.options];
                                                                    updatedOptions[idx] = { ...updatedOptions[idx], player_name: e.target.value };
                                                                    handleInputChange(
                                                                        prop.prop_id,
                                                                        "options",
                                                                        updatedOptions,
                                                                        "anytimeTd"
                                                                    );
                                                                }}
                                                                placeholder="Player name"
                                                            />
                                                            <input
                                                                type="number"
                                                                className="w-28 p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                                                                value={opt.td_line}
                                                                onChange={(e) => {
                                                                    const updatedOptions = [...prop.options];
                                                                    updatedOptions[idx] = { ...updatedOptions[idx], td_line: parseFloat(e.target.value) };
                                                                    handleInputChange(
                                                                        prop.prop_id,
                                                                        "options",
                                                                        updatedOptions,
                                                                        "anytimeTd"
                                                                    );
                                                                }}
                                                                step={0.5}
                                                                placeholder="TD Line"
                                                            />
                                                            <input
                                                                type="number"
                                                                className="w-24 p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                                                                value={opt.points}
                                                                onChange={(e) => {
                                                                    const updatedOptions = [...prop.options];
                                                                    updatedOptions[idx] = { ...updatedOptions[idx], points: parseFloat(e.target.value) };
                                                                    handleInputChange(
                                                                        prop.prop_id,
                                                                        "options",
                                                                        updatedOptions,
                                                                        "anytimeTd"
                                                                    );
                                                                }}
                                                                step={0.5}
                                                                placeholder="Points"
                                                            />
                                                            <button
                                                                type="button"
                                                                className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
                                                                onClick={() => {
                                                                    const updatedOptions = prop.options.filter((_, i) => i !== idx);
                                                                    handleInputChange(
                                                                        prop.prop_id,
                                                                        "options",
                                                                        updatedOptions,
                                                                        "anytimeTd"
                                                                    );
                                                                }}
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg mt-2"
                                                        onClick={() => {
                                                            const updatedOptions = [...(prop.options || []), { player_name: "", td_line: 0.5, points: 1 }];
                                                            handleInputChange(
                                                                prop.prop_id,
                                                                "options",
                                                                updatedOptions,
                                                                "anytimeTd"
                                                            );
                                                        }}
                                                    >
                                                        + Add Player Option
                                                    </button>
                                                </div>

                                                {/* Mandatory Checkbox */}
                                                <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                                    <input
                                                        type="checkbox"
                                                        id={`mandatory-td-${prop.prop_id}`}
                                                        checked={prop.is_mandatory === true}
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                prop.prop_id,
                                                                "is_mandatory",
                                                                e.target.checked,
                                                                "anytimeTd"
                                                            )
                                                        }
                                                        className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <label htmlFor={`mandatory-td-${prop.prop_id}`} className="text-sm text-gray-300 cursor-pointer">
                                                        Make this prop <span className="font-semibold text-blue-400">mandatory</span> (all players must answer)
                                                    </label>
                                                </div>

                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleSaveProp(prop.prop_id, "anytimeTd")}
                                                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
                                                    >
                                                        Done
                                                    </button>
                                                    <button
                                                        onClick={() => toggleEditing(prop.prop_id)}
                                                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <h5 className="text-lg font-semibold text-white">{prop.question}</h5>
                                                <div className="text-gray-300">
                                                    <p className="text-sm text-gray-400 mb-2">Player Options:</p>
                                                    {prop.options && prop.options.map((opt, idx) => (
                                                        <p key={idx}>
                                                            • {opt.player_name} - {opt.td_line >= 1 ? Math.ceil(opt.td_line) : 1}+ TD{Math.ceil(opt.td_line) > 1 ? 's' : ''} ({opt.points} pts)
                                                        </p>
                                                    ))}
                                                </div>
                                                <div className="flex space-x-2 pt-2">
                                                    <button
                                                        onClick={() => toggleEditing(prop.prop_id)}
                                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProp(prop.prop_id, "anytime_td")}
                                                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Save/Discard and Delete Buttons */}
                        <div className="mt-8 pt-6 border-t border-white/10">
                            <div className="flex justify-between items-center">
                                <button
                                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                                    onClick={handleDeleteGame}
                                >
                                    Delete Entire Game
                                </button>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleDiscardChanges}
                                        disabled={!hasUnsavedChanges}
                                        className={`px-5 py-3 rounded-lg font-semibold transition ${
                                            hasUnsavedChanges
                                                ? 'bg-gray-600 hover:bg-gray-700 text-white'
                                                : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        Discard Changes
                                    </button>
                                    <button
                                        onClick={handleSaveAllChanges}
                                        disabled={!hasUnsavedChanges || isSaving}
                                        className={`px-8 py-3 rounded-lg font-semibold transition ${
                                            hasUnsavedChanges && !isSaving
                                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                                : 'bg-emerald-500/50 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Game' : 'No Changes'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default EditGameForm;
