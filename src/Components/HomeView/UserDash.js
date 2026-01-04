import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Trophy, Target, Clock } from "lucide-react";
import LeagueCard from "./LeagueCard";
import { getUsername } from "../../App";
import EmptyState from "./EmptyState";


// Simple inline stat card (you can extract later)
const StatCard = ({ label, value, icon }) => (
  <div className="flex flex-col gap-2 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
    <div className="flex items-center gap-2 text-gray-400">
      {icon && <span className="text-emerald-400">{icon}</span>}
      <span className="text-sm">{label}</span>
    </div>
    <div className="text-3xl text-white">{value}</div>
  </div>
);

// Simple inline skeleton card
const SkeletonCard = () => (
  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm animate-pulse">
    <div className="flex flex-col gap-4">
      <div className="h-6 w-3/4 bg-white/10 rounded-lg" />
      <div className="flex flex-col gap-2">
        <div className="h-4 w-1/2 bg-white/10 rounded-lg" />
        <div className="h-4 w-1/3 bg-white/10 rounded-lg" />
      </div>
      <div className="h-8 w-32 bg-white/10 rounded-full" />
      <div className="h-5 w-28 bg-white/10 rounded-lg mt-2" />
    </div>
  </div>
);

const UserDash = () => {
  const [usersLeagues, setUsersLeagues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [allGames, setAllGames] = useState([]);
  const [userAnswers, setUserAnswers] = useState({
    winnerLoser: {},
    overUnder: {},
    variableOption: {}
  });

  const username = getUsername();
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function getUsersLeagues() {
      setIsLoading(true);
      setErrorMsg("");

      if (!apiUrl) {
        setErrorMsg("Missing REACT_APP_API_URL");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${apiUrl}/get_users_leagues?username=${encodeURIComponent(username)}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          setErrorMsg(`Failed to load leagues (HTTP ${response.status})`);
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        if (isMounted) setUsersLeagues(Array.isArray(data) ? data : []);
      } catch (e) {
        if (isMounted) setErrorMsg("Network error loading leagues.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    getUsersLeagues();
    return () => {
      isMounted = false;
    };
  }, [apiUrl, username]);

  // Fetch all games across all leagues
  useEffect(() => {
    async function fetchAllGamesAndAnswers() {
      if (!apiUrl || !username || usersLeagues.length === 0) return;

      try {
        // Fetch games from all leagues
        const gamesPromises = usersLeagues.map((league) =>
          fetch(`${apiUrl}/get_games?leagueName=${encodeURIComponent(league.league_name)}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }).then((res) => (res.ok ? res.json() : []))
        );

        // Fetch user answers from all leagues
        const answersPromises = usersLeagues.map((league) =>
          Promise.all([
            fetch(
              `${apiUrl}/retrieve_winner_loser_answers?leagueName=${encodeURIComponent(
                league.league_name
              )}&username=${encodeURIComponent(username)}`,
              { method: "GET", headers: { "Content-Type": "application/json" }, credentials: "include" }
            ).then((res) => (res.ok ? res.json() : {})),
            fetch(
              `${apiUrl}/retrieve_over_under_answers?leagueName=${encodeURIComponent(
                league.league_name
              )}&username=${encodeURIComponent(username)}`,
              { method: "GET", headers: { "Content-Type": "application/json" }, credentials: "include" }
            ).then((res) => (res.ok ? res.json() : {})),
            fetch(
              `${apiUrl}/retrieve_variable_option_answers?leagueName=${encodeURIComponent(
                league.league_name
              )}&username=${encodeURIComponent(username)}`,
              { method: "GET", headers: { "Content-Type": "application/json" }, credentials: "include" }
            ).then((res) => (res.ok ? res.json() : {})),
          ])
        );

        const [gamesResults, answersResults] = await Promise.all([
          Promise.all(gamesPromises),
          Promise.all(answersPromises),
        ]);

        // Flatten all games
        const allGamesFlat = gamesResults.flat();
        setAllGames(allGamesFlat);

        // Merge all answers
        const mergedAnswers = answersResults.reduce(
          (acc, [wl, ou, vo]) => ({
            winnerLoser: { ...acc.winnerLoser, ...wl },
            overUnder: { ...acc.overUnder, ...ou },
            variableOption: { ...acc.variableOption, ...vo },
          }),
          { winnerLoser: {}, overUnder: {}, variableOption: {} }
        );
        setUserAnswers(mergedAnswers);
      } catch (err) {
        console.error("Error fetching games and answers:", err);
      }
    }

    fetchAllGamesAndAnswers();
  }, [apiUrl, username, usersLeagues]);

  const filteredLeagues = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return usersLeagues;

    return usersLeagues.filter((league) => {
      const name = (league.league_name || "").toLowerCase();
      const code = (league.join_code || "").toLowerCase();
      return name.includes(q) || code.includes(q);
    });
  }, [usersLeagues, searchQuery]);

  const handleCreateLeague = () => navigate("/league-create");
  const handleJoinLeague = () => navigate("/league-join");

  // Calculate active picks and upcoming lock time
  const { activePicks, upcomingLock } = useMemo(() => {
    if (allGames.length === 0) {
      return { activePicks: 0, upcomingLock: "—" };
    }

    const now = Date.now();
    let totalIncomplete = 0;
    let nextLockTime = null;

    allGames.forEach((game) => {
      const startTime = game.start_time ? new Date(game.start_time).getTime() : null;

      // Only count games that haven't started yet
      if (!startTime || startTime <= now) return;

      // Check if user has answered all props
      const wlProps = game.winner_loser_props || [];
      const ouProps = game.over_under_props || [];
      const voProps = game.variable_option_props || [];
      const totalProps = wlProps.length + ouProps.length + voProps.length;

      if (totalProps === 0) return;

      let answeredCount = 0;

      wlProps.forEach((prop) => {
        if (userAnswers.winnerLoser[prop.prop_id] || userAnswers.winnerLoser[String(prop.prop_id)]) {
          answeredCount++;
        }
      });

      ouProps.forEach((prop) => {
        if (userAnswers.overUnder[prop.prop_id] || userAnswers.overUnder[String(prop.prop_id)]) {
          answeredCount++;
        }
      });

      voProps.forEach((prop) => {
        if (userAnswers.variableOption[prop.prop_id] || userAnswers.variableOption[String(prop.prop_id)]) {
          answeredCount++;
        }
      });

      // If not fully answered, count as active pick
      if (answeredCount < totalProps) {
        totalIncomplete++;
      }

      // Track earliest lock time
      if (!nextLockTime || startTime < nextLockTime) {
        nextLockTime = startTime;
      }
    });

    let lockLabel = "—";
    if (nextLockTime) {
      try {
        const d = new Date(nextLockTime);
        const weekday = d.toLocaleDateString(undefined, { weekday: "short" });
        const monthDay = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
        const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
        lockLabel = `${weekday}, ${monthDay} • ${time}`;
      } catch {
        lockLabel = "—";
      }
    }

    return {
      activePicks: totalIncomplete,
      upcomingLock: lockLabel,
    };
  }, [allGames, userAnswers]);

  return (
    <div className="min-h-screen bg-zinc-950 relative">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl sm:text-5xl text-white mb-2">
                Dashboard
              </h1>
              <p className="text-gray-400 text-lg">
                Your leagues and quick actions
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCreateLeague}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white transition-all hover:shadow-xl hover:shadow-emerald-500/50 hover:scale-[1.02] whitespace-nowrap"
              >
                Create League
              </button>
              <button
                onClick={handleJoinLeague}
                className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-emerald-500/50 transition-all whitespace-nowrap"
              >
                Join League
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <StatCard
              label="Leagues"
              value={usersLeagues.length}
              icon={<Trophy className="w-4 h-4" />}
            />
            <StatCard
              label="Active Picks"
              value={activePicks}
              icon={<Target className="w-4 h-4" />}
            />
            <StatCard
              label="Upcoming Lock"
              value={upcomingLock}
              icon={<Clock className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 px-4 py-3 text-sm">
            {errorMsg}
          </div>
        )}

        {/* Leagues Section */}
        {isLoading ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-white">Your Leagues</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        ) : usersLeagues.length === 0 ? (
          <EmptyState
            onCreateLeague={handleCreateLeague}
            onJoinLeague={handleJoinLeague}
          />
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-2xl text-white">Your Leagues</h2>

              <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leagues…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 backdrop-blur-sm focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            {filteredLeagues.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">
                  No leagues found matching “{searchQuery}”
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLeagues.map((league, index) => (
                  <LeagueCard key={league.id ?? index} league={league} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDash;
