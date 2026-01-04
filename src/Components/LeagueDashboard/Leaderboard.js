import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Trophy, Medal, Award } from "lucide-react";
import { getUsername } from "../../App";

const LeaderboardRow = ({ rank, username, points, isCurrentUser }) => {
  const rankIcon = () => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="text-gray-400 w-5 text-center">{rank}</span>;
  };

  return (
    <div
      className={`flex items-center justify-between px-5 py-4 rounded-xl transition-all ${
        isCurrentUser
          ? "bg-emerald-500/10 border border-emerald-500/30"
          : "bg-white/5 hover:bg-white/10"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="w-8 flex justify-center">{rankIcon()}</div>

        <div className="flex items-center gap-2">
          <span className={isCurrentUser ? "text-white" : "text-gray-300"}>
            {username}
          </span>
          {isCurrentUser && (
            <span className="text-emerald-400 text-sm">(You)</span>
          )}
        </div>
      </div>

      <span className="text-emerald-400 font-medium">{points}</span>
    </div>
  );
};

const Leaderboard = () => {
  const [playerStandings, setPlayerStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const { leagueName } = useParams();
  const apiUrl = process.env.REACT_APP_API_URL;
  const currentUsername = getUsername(); // from localStorage per your helper

  useEffect(() => {
    let mounted = true;

    async function getPlayerStandings() {
      try {
        setLoading(true);
        setErrorMsg("");

        const response = await fetch(
          `${apiUrl}/get_player_standings?leagueName=${encodeURIComponent(
            leagueName
          )}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const players = Array.isArray(data?.league_players)
          ? [...data.league_players]
          : [];

        players.sort((a, b) => (b.points || 0) - (a.points || 0));

        if (mounted) setPlayerStandings(players);
      } catch (error) {
        console.error(error);
        if (mounted) setErrorMsg("Could not load leaderboard.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (apiUrl && leagueName) getPlayerStandings();

    return () => {
      mounted = false;
    };
  }, [apiUrl, leagueName]);

  const rows = useMemo(() => {
    // Normalize username display + current-user check:
    // Your API currently uses player.name (based on User.js).
    // If it ever switches to username, this still works.
    return playerStandings.map((p, idx) => {
      const displayName = p?.name ?? p?.username ?? "Unknown";
      const points = p?.points ?? 0;

      const isCurrentUser =
        (currentUsername || "").toLowerCase() ===
        String(displayName).toLowerCase();

      return {
        rank: idx + 1,
        username: displayName,
        points,
        isCurrentUser,
      };
    });
  }, [playerStandings, currentUsername]);

  if (loading) {
    return <div className="text-gray-400">Loading leaderboard…</div>;
  }

  if (errorMsg) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 px-4 py-3 text-sm">
        {errorMsg}
      </div>
    );
  }

  if (rows.length === 0) {
    return <div className="text-gray-400">No players yet.</div>;
  }

  return (
    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
      {rows.map((r) => (
        <LeaderboardRow
          key={r.username}
          rank={r.rank}
          username={r.username}
          points={r.points}
          isCurrentUser={r.isCurrentUser}
        />
      ))}
    </div>
  );
};

export default Leaderboard;
