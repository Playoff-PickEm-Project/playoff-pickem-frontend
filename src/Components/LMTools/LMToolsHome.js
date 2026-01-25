import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUsername } from "../../App";
import GameFormBuilder from "../GameFormBuilder";
import {
  Gamepad2,
  FileText,
  UserPlus,
  Trash2,
  AlertTriangle,
  X,
  Edit2,
  Check,
} from "lucide-react";

/**
 * Inline copy of Figma Make LeaguePlayersCard.tsx (no external file)
 * (kept JS-friendly, no TS interfaces)
 */
function LeaguePlayersCard({ players, onUpdatePoints, onDeletePlayer }) {
  const [editingId, setEditingId] = useState(null);
  const [editPoints, setEditPoints] = useState(0);

  const handleStartEdit = (player) => {
    setEditingId(player.id);
    setEditPoints(player.points);
  };

  const handleSaveEdit = (playerId) => {
    onUpdatePoints(playerId, editPoints);
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
      <h2 className="text-2xl text-white mb-6">League Players</h2>

      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between px-5 py-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0 justify-start text-left">
              <div className="flex-1 min-w-0 text-left">
                <div className="text-white">
                  {player.username}
                  {player.isCommissioner && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      Commissioner
                    </span>
                  )}
                </div>
              </div>

              {editingId === player.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editPoints}
                    onChange={(e) => setEditPoints(Number(e.target.value))}
                    className="w-24 px-3 py-2 rounded-lg bg-white/5 border border-emerald-500/50 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveEdit(player.id)}
                    className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white transition-all"
                    title="Save"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-emerald-400">{player.points} pts</div>
              )}
            </div>

            {editingId !== player.id && (
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleStartEdit(player)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 transition-all"
                  title="Edit points"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeletePlayer(player.id)}
                  disabled={player.isCommissioner}
                  className={`p-2 rounded-lg transition-all ${
                    player.isCommissioner
                      ? "bg-white/5 text-gray-600 cursor-not-allowed opacity-50"
                      : "bg-white/5 hover:bg-red-500/10 text-red-400 hover:text-red-300"
                  }`}
                  title={player.isCommissioner ? "Cannot delete commissioner" : "Delete player"}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const LMToolsHome = () => {
  const [isCommissioner, setIsCommissioner] = useState(false);

  const { leagueName } = useParams();
  const [league, setLeague] = useState({});
  const username = getUsername();
  const navigate = useNavigate();
  const [userID, setUserID] = useState(null);

  const [showDeleteLeagueModal, setShowDeleteLeagueModal] = useState(false);
  const [showDeletePlayerModal, setDeletePlayerModal] = useState(null); // stores player object or null

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const leagueResponse = await fetch(
          `${apiUrl}/get_league_by_name?leagueName=${leagueName}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!leagueResponse.ok) {
          throw new Error(`HTTP error! status: ${leagueResponse.status}`);
        }

        const leagueData = await leagueResponse.json();
        setLeague(leagueData);
        setUserID(leagueData?.commissioner?.user_id);

        const userResponse = await fetch(
          `${apiUrl}/get_user_by_username?username=${encodeURIComponent(username)}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!userResponse.ok) {
          throw new Error(`HTTP error! status: ${userResponse.status}`);
        }

        const userData = await userResponse.json();

        if (leagueData?.commissioner?.user_id === userData?.id) {
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

  const playersRaw = useMemo(() => {
    if (!league?.league_players || !Array.isArray(league.league_players)) return [];
    return league.league_players;
  }, [league]);

  const joinCode = league?.join_code || league?.joinCode;

  const handleDeleteLeague = async () => {
    const data = { leagueName };

    try {
      const response = await fetch(`${apiUrl}/delete_league`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("League deleted successfully.");
        navigate("/league-list");
      } else {
        alert("Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      alert("Endpoint wasn't reached.");
    }
  };

  const handleDeletePlayer = async (playername) => {
    const data = {
      leaguename: leagueName,
      playerName: playername,
    };

    try {
      const response = await fetch(`${apiUrl}/delete_player`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Player deleted successfully.");

        // remove from UI immediately
        setLeague((prev) => ({
          ...prev,
          league_players: (prev.league_players || []).filter((p) => {
            const pname = p?.name || p?.username;
            return pname !== playername;
          }),
        }));

        navigate(`/league-home/${leagueName}/league_manager_tools`);
      } else {
        alert("Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      alert("Network error deleting player.");
    }
  };

  const handleSavePoints = async (playerId, newPoints) => {
    const data = {
      player_id: playerId,
      new_points: newPoints,
    };

    try {
      const response = await fetch(`${apiUrl}/save_new_points`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        alert("Error saving points.");
        return;
      }

      // update UI immediately
      setLeague((prev) => ({
        ...prev,
        league_players: (prev.league_players || []).map((p, idx) => {
          const pid = p?.id ?? p?.user_id ?? idx;
          if (pid === playerId) return { ...p, points: newPoints };
          return p;
        }),
      }));
    } catch (error) {
      console.error(error);
      alert("Network error saving points.");
    }
  };

  const handleViewAllGames = () => navigate(`/league-home/${leagueName}/games`);
  const handleLeagueRules = () => alert("TODO: League rules modal/page");

  const handleInvitePlayers = async () => {
    if (!joinCode) {
      alert("Join code not available yet.");
      return;
    }
    try {
      await navigator.clipboard?.writeText(joinCode);
      alert("Invite code copied!");
    } catch {
      alert(`Invite code: ${joinCode}`);
    }
  };

  // Map your backend data into the exact shape Figma card expects
  const players = useMemo(() => {
    return playersRaw.map((p, idx) => {
      const pid = p?.id ?? p?.user_id ?? idx;

      const isComm =
        !!p?.isCommissioner ||
        pid === league?.commissioner_id ||
        p?.user_id === userID ||
        pid === userID;

      return {
        id: pid,
        username: p?.username ?? p?.name ?? "Unknown",
        points: Number(p?.points ?? 0),
        isCommissioner: !!isComm,
        __raw: p,
      };
    });
  }, [playersRaw, league, userID]);

  return (
    <div className="min-h-screen bg-zinc-950 relative">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl sm:text-5xl text-white mb-2">League Manager Tools</h1>
              <p className="text-gray-400 text-lg text-left">Manage games, players, and league settings</p>
            </div>

            <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm whitespace-nowrap self-start">
              Commissioner View
            </div>
          </div>
          <div className="h-px bg-white/10 mt-8" />
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Game Builder Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-start justify-between gap-4 mb-4 text-left">
                <div>
                  <h2 className="text-2xl text-white mb-1">Game Builder</h2>
                  <p className="text-gray-400 text-sm">Create or schedule games for this league.</p>
                </div>

                <button
                  onClick={handleViewAllGames}
                  className="hidden sm:inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all"
                >
                  <Gamepad2 className="w-5 h-5 text-emerald-400" />
                  <span>View All Games</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-black/20 border border-white/10">
                <GameFormBuilder />
              </div>
            </div>

            {/* League Players Card (Figma Make component) */}
            <LeaguePlayersCard
              players={players}
              onUpdatePoints={(playerId, newPoints) => handleSavePoints(playerId, newPoints)}
              onDeletePlayer={(playerId) => {
                const player = players.find((pl) => pl.id === playerId);
                if (!player) return;
                setDeletePlayerModal(player.__raw || player);
              }}
            />
          </div>

          {/* Right Column (1/3) */}
          <div className="space-y-6">
            {/* League Actions */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <h3 className="text-xl text-white mb-4">League Actions</h3>

              <div className="space-y-3">
                <button
                  onClick={handleViewAllGames}
                  className="w-full flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all"
                >
                  <Gamepad2 className="w-5 h-5 text-emerald-400" />
                  <span>View All Games</span>
                </button>

                <button
                  onClick={handleLeagueRules}
                  className="w-full flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all"
                >
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <span>League Rules</span>
                </button>

                <button
                  onClick={handleInvitePlayers}
                  className="w-full flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all"
                >
                  <UserPlus className="w-5 h-5 text-emerald-400" />
                  <span>Copy Invite Code</span>
                </button>
              </div>
            </div>

            {/* Invite Code */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <h3 className="text-xl text-white mb-4">Invite Code</h3>

              <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-black/20 border border-white/10">
                <span className="text-white font-mono tracking-wider">{joinCode || "—"}</span>
                <button
                  onClick={handleInvitePlayers}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!joinCode}
                >
                  Copy
                </button>
              </div>

              <p className="text-gray-400 text-sm mt-3">
                Share this code with friends so they can join your league.
              </p>
            </div>

            {/* Danger Zone */}
            <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/30 backdrop-blur-sm">
              <h3 className="text-xl text-red-400 mb-2">Delete League</h3>
              <p className="text-sm text-gray-400 mb-4">
                Deleting the league is permanent and cannot be undone.
              </p>

              <button
                onClick={() => setShowDeleteLeagueModal(true)}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-500/10 hover:bg-red-500 border border-red-500/30 text-red-400 hover:text-white transition-all"
              >
                <Trash2 className="w-5 h-5" />
                <span>Delete League</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Player Modal */}
      {showDeletePlayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setDeletePlayerModal(null)}
          />
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl">
            <button
              onClick={() => setDeletePlayerModal(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>

              <h2 className="text-2xl text-white mb-3">Remove Player</h2>
              <p className="text-gray-400 mb-8">
                Are you sure you want to remove{" "}
                <span className="text-white font-medium">
                  {showDeletePlayerModal?.name || showDeletePlayerModal?.username}
                </span>{" "}
                from the league? This action cannot be undone.
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDeletePlayerModal(null)}
                  className="flex-1 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const pname =
                      showDeletePlayerModal?.name || showDeletePlayerModal?.username;
                    setDeletePlayerModal(null);
                    await handleDeletePlayer(pname);
                  }}
                  className="flex-1 px-6 py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white transition-all hover:shadow-xl hover:shadow-red-500/50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete League Modal */}
      {showDeleteLeagueModal && (
        <DeleteLeagueConfirmModal
          leagueName={league?.name || leagueName}
          onCancel={() => setShowDeleteLeagueModal(false)}
          onConfirm={async () => {
            setShowDeleteLeagueModal(false);
            await handleDeleteLeague();
          }}
        />
      )}
    </div>
  );
};

function DeleteLeagueConfirmModal({ leagueName, onCancel, onConfirm }) {
  const [confirmText, setConfirmText] = useState("");
  const canDelete = confirmText === "DELETE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative w-full max-w-md p-6 rounded-3xl bg-zinc-900 border border-red-500/30 shadow-2xl shadow-red-500/20">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="p-3 rounded-full bg-red-500/10 border border-red-500/30 mb-4">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>

          <h2 className="text-2xl text-white mb-3">Delete League</h2>
          <p className="text-gray-400 mb-2">
            You are about to permanently delete{" "}
            <span className="text-white font-medium">{leagueName}</span>.
          </p>
          <p className="text-red-400 text-sm mb-6">
            ⚠️ This action is irreversible. All games, picks, and player data will be lost forever.
          </p>

          <div className="w-full mb-6">
            <label htmlFor="confirmDelete" className="block text-left text-sm text-gray-400 mb-2">
              Type <span className="text-white font-mono">DELETE</span> to confirm
            </label>
            <input
              type="text"
              id="confirmDelete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-5 py-3 rounded-xl bg-white/5 border border-red-500/30 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
            />
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={!canDelete}
              className={`flex-1 px-6 py-3 rounded-xl text-white transition-all ${
                canDelete
                  ? "bg-red-500 hover:bg-red-400 hover:shadow-xl hover:shadow-red-500/50"
                  : "bg-red-500/30 cursor-not-allowed"
              }`}
            >
              Delete League
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LMToolsHome;
