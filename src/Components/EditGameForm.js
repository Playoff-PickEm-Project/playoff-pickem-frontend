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
        <div className="min-h-screen bg-zinc-950 relative">
            {/* Background gradient effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* Header */}
            <div className="mb-8 sm:mb-12 text-left">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-4xl sm:text-5xl text-white mb-2">Edit Game</h1>
                    <p className="text-gray-400 text-lg">
                    Edit props, lock time, and ESPN polling settings for{" "}
                    <span className="text-white">{gameName || "this game"}</span>
                    </p>
                </div>

                <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm whitespace-nowrap self-start">
                    Commissioner View
                </div>
                </div>
                <div className="h-px bg-white/10 mt-8" />
            </div>

            {!isCommissioner && (
                <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/30 backdrop-blur-sm">
                <p className="text-red-400">You do not have permission to edit this game.</p>
                </div>
            )}

            {isCommissioner && (
                <div className="space-y-6 sm:space-y-8">
                {/* ESPN Game Settings */}
                <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <div className="mb-6">
                    <h2 className="text-2xl text-white mb-1">ESPN Game Settings</h2>
                    <p className="text-gray-400 text-sm">
                        Link an ESPN game for automatic polling (optional), and edit game metadata.
                    </p>
                    </div>

                    <div className="space-y-5">
                    <div>
                        <label className="block text-white mb-2">
                        Select NFL Game (Optional - for live polling)
                        </label>

                        {loadingGames ? (
                        <p className="text-sm text-gray-400">Loading upcoming games...</p>
                        ) : (
                        <select
                            className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer"
                            value={externalGameId}
                            onChange={(e) => {
                            const selectedGameId = e.target.value
                            setHasUnsavedChanges(true)
                            setExternalGameId(selectedGameId)

                            if (selectedGameId) {
                                const selectedGame = upcomingGames.find((g) => g.id === selectedGameId)
                                if (selectedGame) {
                                const newGameName = (selectedGame.name || selectedGame.shortName).replace(
                                    / at /gi,
                                    " @ "
                                )
                                setGameName(newGameName)
                                setGameStartDate(new Date(selectedGame.date))
                                }
                                fetchPlayersForGame(selectedGameId)
                            } else {
                                setAvailablePlayers([])
                            }
                            }}
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
                        Select an upcoming NFL game for automatic live stat polling.
                        </p>
                    </div>

                    <div>
                        <label className="block text-white mb-2">Game Name</label>
                        <input
                        type="text"
                        className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        value={gameName}
                        onChange={(e) => {
                            setHasUnsavedChanges(true)
                            setGameName(e.target.value)
                        }}
                        placeholder="Enter game name"
                        />
                    </div>

                    <div>
                        <label className="block text-white mb-2">Game Start Date & Time</label>
                        <input
                        type="datetime-local"
                        className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        value={getLocalDateString(gameStartDate)}
                        onChange={(e) => {
                            setHasUnsavedChanges(true)
                            setGameStartDate(new Date(e.target.value))
                        }}
                        />
                        <p className="mt-2 text-sm text-gray-400">This timestamp is used as the lock time.</p>
                    </div>

                    <div>
                        <label className="block text-white mb-2">
                        Number of Optional Props Players Must Answer
                        </label>
                        <input
                        type="number"
                        min="0"
                        max="20"
                        className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        value={propLimit}
                        onChange={(e) => {
                            setHasUnsavedChanges(true)
                            const val = parseInt(e.target.value)
                            setPropLimit(isNaN(val) ? 2 : val)
                        }}
                        />
                        <p className="mt-2 text-sm text-gray-400">
                        Players will select {propLimit} props from the optional pool (mandatory props are always
                        required).
                        </p>
                    </div>
                    </div>
                </div>

                {/* Add New Props */}
                <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <div className="mb-6">
                    <h2 className="text-2xl text-white mb-1">Add New Props</h2>
                    <p className="text-gray-400 text-sm">Create new props and then edit details below.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleAddWinnerLoserProp}
                        type="button"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white transition-all hover:shadow-xl hover:shadow-emerald-500/50"
                    >
                        + Winner/Loser
                    </button>

                    <button
                        onClick={handleAddOverUnderProp}
                        type="button"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                    >
                        + Over/Under
                    </button>

                    <button
                        onClick={handleAddRandomProp}
                        type="button"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                    >
                        + Random
                    </button>
                    </div>
                </div>

                {/* Winner/Loser Props */}
                <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <div className="mb-6">
                    <h2 className="text-2xl text-white mb-1">Winner/Loser Props</h2>
                    <p className="text-gray-400 text-sm">{winnerLoserProps.length} props</p>
                    </div>

                    {winnerLoserProps.length === 0 ? (
                    <p className="text-gray-400">No Winner/Loser props yet.</p>
                    ) : (
                    <div className="space-y-3">
                        {winnerLoserProps.map((prop) => (
                        <div
                            key={prop.prop_id}
                            className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                        >
                            {editingProps[prop.prop_id] ? (
                            <div className="space-y-4">
                                <div>
                                <label className="block text-gray-300 mb-2">Question</label>
                                <input
                                    type="text"
                                    className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    value={prop.question}
                                    onChange={(e) =>
                                    handleInputChange(prop.prop_id, "question", e.target.value, "winnerLoser")
                                    }
                                />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-300 mb-2">Favorite Team</label>
                                    {externalGameId && getTeamsFromSelectedGame().length > 0 ? (
                                    <select
                                        className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer"
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
                                        <option key={team.id} value={team.name} className="bg-zinc-900">
                                            {team.name} ({team.abbreviation})
                                        </option>
                                        ))}
                                    </select>
                                    ) : (
                                    <input
                                        type="text"
                                        className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
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
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-2">Favorite Points</label>
                                    <input
                                    type="number"
                                    step="0.5"
                                    className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    value={prop.favorite_points}
                                    onChange={(e) =>
                                        handleInputChange(
                                        prop.prop_id,
                                        "favorite_points",
                                        e.target.value,
                                        "winnerLoser"
                                        )
                                    }
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-2">Underdog Team</label>
                                    {externalGameId && getTeamsFromSelectedGame().length > 0 ? (
                                    <select
                                        className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer"
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
                                        <option key={team.id} value={team.name} className="bg-zinc-900">
                                            {team.name} ({team.abbreviation})
                                        </option>
                                        ))}
                                    </select>
                                    ) : (
                                    <input
                                        type="text"
                                        className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
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
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-2">Underdog Points</label>
                                    <input
                                    type="number"
                                    step="0.5"
                                    className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    value={prop.underdog_points}
                                    onChange={(e) =>
                                        handleInputChange(
                                        prop.prop_id,
                                        "underdog_points",
                                        e.target.value,
                                        "winnerLoser"
                                        )
                                    }
                                    />
                                </div>
                                </div>

                                <div className="flex items-center gap-3">
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
                                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                />
                                <label htmlFor={`mandatory-${prop.prop_id}`} className="text-sm text-gray-300">
                                    Mandatory prop (all players must answer)
                                </label>
                                </div>

                                <div className="flex gap-3">
                                <button
                                    onClick={() => handleSaveProp(prop.prop_id, "winnerLoser")}
                                    type="button"
                                    className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white transition-all"
                                >
                                    Done
                                </button>
                                <button
                                    onClick={() => toggleEditing(prop.prop_id)}
                                    type="button"
                                    className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                                </div>
                            </div>
                            ) : (
                            <div className="space-y-3">
                                <div className="text-white font-medium">{prop.question}</div>

                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="text-gray-300">
                                    <span className="text-emerald-400 font-semibold">{prop.favorite_team}</span>:{" "}
                                    {prop.favorite_points} pts
                                    <span className="mx-2 text-white/20">|</span>
                                    <span className="text-emerald-300 font-semibold">{prop.underdog_team}</span>:{" "}
                                    {prop.underdog_points} pts
                                </div>

                                <div className="flex gap-2">
                                    <button
                                    onClick={() => toggleEditing(prop.prop_id)}
                                    type="button"
                                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                                    >
                                    Edit
                                    </button>
                                    <button
                                    onClick={() => handleDeleteProp(prop.prop_id, "winner_loser")}
                                    type="button"
                                    className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500 border border-red-500/30 text-red-300 hover:text-white transition-all"
                                    >
                                    Delete
                                    </button>
                                </div>
                                </div>
                            </div>
                            )}
                        </div>
                        ))}
                    </div>
                    )}
                </div>

                {/* Over/Under Props */}
                <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <div className="mb-6">
                    <h2 className="text-2xl text-white mb-1">Over/Under Props</h2>
                    <p className="text-gray-400 text-sm">{overUnderProps.length} props</p>
                    </div>

                    {overUnderProps.length === 0 ? (
                    <p className="text-gray-400">No Over/Under props yet.</p>
                    ) : (
                    <div className="space-y-3">
                        {overUnderProps.map((prop) => (
                        <div
                            key={prop.prop_id}
                            className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                        >
                            {editingProps[prop.prop_id] ? (
                            <div className="space-y-4">
                                <div>
                                <label className="block text-gray-300 mb-2">Question</label>
                                <input
                                    type="text"
                                    className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    value={prop.question}
                                    onChange={(e) =>
                                    handleInputChange(prop.prop_id, "question", e.target.value, "overUnder")
                                    }
                                />
                                </div>

                                {externalGameId && availablePlayers.length > 0 && (
                                <div className="space-y-4 p-4 rounded-2xl bg-black/20 border border-white/10">
                                    <div className="text-white font-medium">ESPN Player Prop Settings</div>

                                    {/* Player selection */}
                                    <div className="relative">
                                    <label className="block text-gray-300 mb-2">Select Player</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                        placeholder="Search for a player..."
                                        value={playerSearchQuery[prop.prop_id] || prop.player_name || ""}
                                        onChange={(e) => {
                                        const searchValue = e.target.value
                                        setPlayerSearchQuery({ ...playerSearchQuery, [prop.prop_id]: searchValue })
                                        setShowPlayerDropdown({ ...showPlayerDropdown, [prop.prop_id]: true })

                                        if (searchValue.trim() === "") {
                                            setFilteredPlayers({
                                            ...filteredPlayers,
                                            [prop.prop_id]: availablePlayers,
                                            })
                                        } else {
                                            const fuse = new Fuse(availablePlayers, {
                                            keys: ["name", "position"],
                                            threshold: 0.3,
                                            })
                                            const results = fuse.search(searchValue)
                                            setFilteredPlayers({
                                            ...filteredPlayers,
                                            [prop.prop_id]: results.map((r) => r.item),
                                            })
                                        }
                                        }}
                                        onFocus={() => {
                                        setShowPlayerDropdown({ ...showPlayerDropdown, [prop.prop_id]: true })
                                        if (!filteredPlayers[prop.prop_id]) {
                                            setFilteredPlayers({
                                            ...filteredPlayers,
                                            [prop.prop_id]: availablePlayers,
                                            })
                                        }
                                        }}
                                        onBlur={() => {
                                        setTimeout(() => {
                                            setShowPlayerDropdown({ ...showPlayerDropdown, [prop.prop_id]: false })
                                        }, 200)
                                        }}
                                    />

                                    {showPlayerDropdown[prop.prop_id] &&
                                        (filteredPlayers[prop.prop_id] || availablePlayers).length > 0 && (
                                        <div className="absolute z-10 w-full mt-2 rounded-xl bg-zinc-900/95 border border-white/10 shadow-2xl max-h-60 overflow-y-auto">
                                            {(filteredPlayers[prop.prop_id] || availablePlayers).map((player) => (
                                            <div
                                                key={player.id}
                                                className="px-4 py-3 cursor-pointer text-white hover:bg-white/10 transition-all"
                                                onClick={() => {
                                                handleInputChange(prop.prop_id, "player_name", player.name, "overUnder")
                                                handleInputChange(prop.prop_id, "player_id", player.id, "overUnder")
                                                setPlayerSearchQuery({
                                                    ...playerSearchQuery,
                                                    [prop.prop_id]: player.name,
                                                })
                                                setShowPlayerDropdown({
                                                    ...showPlayerDropdown,
                                                    [prop.prop_id]: false,
                                                })
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
                                        value={prop.stat_type || ""}
                                        onChange={(e) =>
                                        handleInputChange(prop.prop_id, "stat_type", e.target.value, "overUnder")
                                        }
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
                                        <option value="scrimmage_yards" className="bg-zinc-900">
                                        Scrimmage Yards (Rush + Rec)
                                        </option>
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
                                        value={prop.line_value || ""}
                                        onChange={(e) =>
                                        handleInputChange(prop.prop_id, "line_value", e.target.value, "overUnder")
                                        }
                                    />
                                    </div>
                                </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-300 mb-2">Over Points</label>
                                    <input
                                    type="number"
                                    step="0.5"
                                    className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    value={prop.over_points}
                                    onChange={(e) =>
                                        handleInputChange(prop.prop_id, "over_points", e.target.value, "overUnder")
                                    }
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-2">Under Points</label>
                                    <input
                                    type="number"
                                    step="0.5"
                                    className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    value={prop.under_points}
                                    onChange={(e) =>
                                        handleInputChange(prop.prop_id, "under_points", e.target.value, "overUnder")
                                    }
                                    />
                                </div>
                                </div>

                                <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id={`mandatory-ou-${prop.prop_id}`}
                                    checked={prop.is_mandatory === true}
                                    onChange={(e) =>
                                    handleInputChange(prop.prop_id, "is_mandatory", e.target.checked, "overUnder")
                                    }
                                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                />
                                <label htmlFor={`mandatory-ou-${prop.prop_id}`} className="text-sm text-gray-300">
                                    Mandatory prop (all players must answer)
                                </label>
                                </div>

                                <div className="flex gap-3">
                                <button
                                    onClick={() => handleSaveProp(prop.prop_id, "overUnder")}
                                    type="button"
                                    className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white transition-all"
                                >
                                    Done
                                </button>
                                <button
                                    onClick={() => toggleEditing(prop.prop_id)}
                                    type="button"
                                    className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                                </div>
                            </div>
                            ) : (
                            <div className="space-y-3">
                                <div className="text-white font-medium">{prop.question}</div>

                                {(prop.player_name || prop.stat_type || prop.line_value) && (
                                <div className="text-sm text-gray-400">
                                    {prop.player_name ? `Player: ${prop.player_name}` : ""}
                                    {prop.stat_type ? ` • ${String(prop.stat_type).replace(/_/g, " ")}` : ""}
                                    {prop.line_value ? ` • Line: ${prop.line_value}` : ""}
                                </div>
                                )}

                                <div className="text-gray-300">
                                <span className="text-emerald-400 font-semibold">Over</span>: {prop.over_points} pts
                                <span className="mx-2 text-white/20">|</span>
                                <span className="text-emerald-300 font-semibold">Under</span>: {prop.under_points} pts
                                </div>

                                <div className="flex gap-2">
                                <button
                                    onClick={() => toggleEditing(prop.prop_id)}
                                    type="button"
                                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteProp(prop.prop_id, "over_under")}
                                    type="button"
                                    className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500 border border-red-500/30 text-red-300 hover:text-white transition-all"
                                >
                                    Delete
                                </button>
                                </div>
                            </div>
                            )}
                        </div>
                        ))}
                    </div>
                    )}
                </div>

                {/* Random Props */}
                <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <div className="mb-6">
                    <h2 className="text-2xl text-white mb-1">Random Props</h2>
                    <p className="text-gray-400 text-sm">{variableOptionProps.length} props</p>
                    </div>

                    {variableOptionProps.length === 0 ? (
                    <p className="text-gray-400">No Random props yet.</p>
                    ) : (
                    <div className="space-y-3">
                        {variableOptionProps.map((prop) => (
                        <div
                            key={prop.prop_id}
                            className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                        >
                            {editingProps[prop.prop_id] ? (
                            <div className="space-y-4">
                                <div>
                                <label className="block text-gray-300 mb-2">Question</label>
                                <input
                                    type="text"
                                    className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    value={prop.question}
                                    onChange={(e) =>
                                    handleInputChange(prop.prop_id, "question", e.target.value, "variableOption")
                                    }
                                />
                                </div>

                                <div className="space-y-2">
                                <div className="text-white font-medium">Options</div>

                                {(prop.options || []).map((opt, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="text"
                                        className="flex-1 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                        value={opt.answer_choice}
                                        onChange={(e) => {
                                        const updatedOptions = [...(prop.options || [])]
                                        updatedOptions[idx] = { ...updatedOptions[idx], answer_choice: e.target.value }
                                        handleInputChange(prop.prop_id, "options", updatedOptions, "variableOption")
                                        }}
                                        placeholder={`Option ${idx + 1}`}
                                    />
                                    <input
                                        type="number"
                                        step="0.5"
                                        className="w-32 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                        value={opt.answer_points}
                                        onChange={(e) => {
                                        const updatedOptions = [...(prop.options || [])]
                                        updatedOptions[idx] = {
                                            ...updatedOptions[idx],
                                            answer_points: parseFloat(e.target.value),
                                        }
                                        handleInputChange(prop.prop_id, "options", updatedOptions, "variableOption")
                                        }}
                                        placeholder="Pts"
                                    />
                                    <button
                                        type="button"
                                        className="px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500 border border-red-500/30 text-red-300 hover:text-white transition-all"
                                        onClick={() => {
                                        const updatedOptions = (prop.options || []).filter((_, i) => i !== idx)
                                        handleInputChange(prop.prop_id, "options", updatedOptions, "variableOption")
                                        }}
                                    >
                                        Remove
                                    </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                                    onClick={() => {
                                    const updatedOptions = [
                                        ...(prop.options || []),
                                        { answer_choice: "", answer_points: 1 },
                                    ]
                                    handleInputChange(prop.prop_id, "options", updatedOptions, "variableOption")
                                    }}
                                >
                                    + Add Option
                                </button>
                                </div>

                                <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id={`mandatory-vo-${prop.prop_id}`}
                                    checked={prop.is_mandatory === true}
                                    onChange={(e) =>
                                    handleInputChange(prop.prop_id, "is_mandatory", e.target.checked, "variableOption")
                                    }
                                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                />
                                <label htmlFor={`mandatory-vo-${prop.prop_id}`} className="text-sm text-gray-300">
                                    Mandatory prop (all players must answer)
                                </label>
                                </div>

                                <div className="flex gap-3">
                                <button
                                    onClick={() => handleSaveProp(prop.prop_id, "variableOption")}
                                    type="button"
                                    className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white transition-all"
                                >
                                    Done
                                </button>
                                <button
                                    onClick={() => toggleEditing(prop.prop_id)}
                                    type="button"
                                    className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                                </div>
                            </div>
                            ) : (
                            <div className="space-y-3">
                                <div className="text-white font-medium">{prop.question}</div>
                                <div className="text-gray-300 space-y-1">
                                {(prop.options || []).map((opt, idx) => (
                                    <div key={idx} className="text-sm">
                                    • {opt.answer_choice}{" "}
                                    <span className="text-gray-400">({opt.answer_points} pts)</span>
                                    </div>
                                ))}
                                </div>

                                <div className="flex gap-2">
                                <button
                                    onClick={() => toggleEditing(prop.prop_id)}
                                    type="button"
                                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteProp(prop.prop_id, "variable_option")}
                                    type="button"
                                    className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500 border border-red-500/30 text-red-300 hover:text-white transition-all"
                                >
                                    Delete
                                </button>
                                </div>
                            </div>
                            )}
                        </div>
                        ))}
                    </div>
                    )}
                </div>

                {/* Bottom actions (below the form) */}
                <div className="space-y-6">
                    {/* Changes */}
                    <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <h3 className="text-2xl text-white mb-2">Changes</h3>
                    <p className="text-gray-400 text-sm mb-6">
                        {hasUnsavedChanges ? "You have unsaved changes." : "No changes to save."}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                        onClick={handleDiscardChanges}
                        disabled={!hasUnsavedChanges}
                        type="button"
                        className={`px-6 py-3 rounded-xl border transition-all ${
                            hasUnsavedChanges
                            ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                            : "bg-white/5 border-white/10 text-gray-500 cursor-not-allowed opacity-50"
                        }`}
                        >
                        Discard Changes
                        </button>

                        <button
                        onClick={handleSaveAllChanges}
                        disabled={!hasUnsavedChanges || isSaving}
                        type="button"
                        className={`px-6 py-3 rounded-xl text-white transition-all ${
                            hasUnsavedChanges && !isSaving
                            ? "bg-emerald-500 hover:bg-emerald-400 hover:shadow-xl hover:shadow-emerald-500/50"
                            : "bg-emerald-500/30 cursor-not-allowed"
                        }`}
                        >
                        {isSaving ? "Saving..." : hasUnsavedChanges ? "Save Game" : "No Changes"}
                        </button>
                    </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="p-6 sm:p-8 rounded-3xl bg-red-500/5 border border-red-500/30 backdrop-blur-sm">
                    <h3 className="text-2xl text-red-400 mb-2">Delete Game</h3>
                    <p className="text-sm text-gray-400 mb-6">
                        Deleting this game is permanent and cannot be undone.
                    </p>

                    <button
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 hover:bg-red-500 border border-red-500/30 text-red-400 hover:text-white transition-all"
                        onClick={handleDeleteGame}
                        type="button"
                    >
                        Delete Entire Game
                    </button>
                    </div>
                </div>
                </div>
            )}
            </div>
        </div>
        );


};

export default EditGameForm;
