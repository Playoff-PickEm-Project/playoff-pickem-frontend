import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Trophy, Target, Calendar, Clock } from "lucide-react";

import Leaderboard from "./Leaderboard";
import LeagueHeader from "./LeagueHeader";
import StatsRow from "./StatsRow";
import LeagueActionsPanel from "./LeagueActionsPanel";

import { getUsername } from "../../App";

const LeagueHome = () => {
  const { leagueName } = useParams();
  const navigate = useNavigate();
  const username = getUsername();

  const [isCommissioner, setIsCommissioner] = useState(false);
  const [league, setLeague] = useState(null);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const leagueResponse = await fetch(
          `${apiUrl}/get_league_by_name?leagueName=${encodeURIComponent(leagueName)}`,
          { method: "GET", headers: { "Content-Type": "application/json" } }
        );

        if (!leagueResponse.ok) {
          throw new Error(`HTTP error! status: ${leagueResponse.status}`);
        }

        const leagueData = await leagueResponse.json();
        setLeague(leagueData);

        const userResponse = await fetch(
          `${apiUrl}/get_user_by_username?username=${encodeURIComponent(username)}`,
          { method: "GET", headers: { "Content-Type": "application/json" } }
        );

        if (!userResponse.ok) {
          throw new Error(`HTTP error! status: ${userResponse.status}`);
        }

        const userData = await userResponse.json();
        setIsCommissioner(leagueData?.commissioner?.user_id === userData?.id);
      } catch (error) {
        console.error(error);
        alert("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (apiUrl && leagueName && username) fetchData();
  }, [apiUrl, leagueName, username]);

  const commissionerName = league?.commissioner?.name ?? "—";
  const playerCount = league?.league_players?.length ?? "—";
  const joinCode = league?.join_code ?? "—";

  // Stats placeholders (hook up later)
  const stats = [
    { label: "Your Rank", value: "—", icon: <Trophy className="w-4 h-4" /> },
    { label: "Your Points", value: "—", icon: <Target className="w-4 h-4" /> },
    { label: "Games Remaining", value: "—", icon: <Calendar className="w-4 h-4" /> },
    { label: "Next Lock Time", value: "—", icon: <Clock className="w-4 h-4" /> },
  ];

  const handleMakePicks = () =>
    navigate(`/league-home/${encodeURIComponent(leagueName)}/viewGames`);

  const handleViewAllGames = () =>
    navigate(`/league-home/${encodeURIComponent(leagueName)}/viewGames`);

  const handleLeagueRules = () => alert("League rules coming soon.");

  return (
    <div className="min-h-screen bg-zinc-950 relative">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <LeagueHeader
          leagueName={leagueName}
          commissionerName={commissionerName}
          playerCount={playerCount}
          isCommissioner={isCommissioner}
        />

        <StatsRow stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left column */}
          <div className="lg:col-span-2">
            <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <h2 className="text-2xl text-white mb-6">Leaderboard</h2>
              {loading ? (
                <div className="text-gray-400">Loading leaderboard…</div>
              ) : (
                <Leaderboard />
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Upcoming games (placeholder for now) */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <h3 className="text-xl text-white mb-4">Upcoming Games</h3>

              <div className="px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-gray-300 mb-6">
                <div className="text-white mb-1">Upcoming games will appear here</div>
                <div className="text-sm text-gray-400">
                  Connect this to your games endpoint next.
                </div>
              </div>

              <button
                onClick={handleMakePicks}
                className="w-full px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white transition-all hover:shadow-xl hover:shadow-emerald-500/50 hover:scale-[1.02]"
              >
                Make Picks
              </button>
            </div>

            <LeagueActionsPanel
              joinCode={joinCode}
              onViewAllGames={handleViewAllGames}
              onLeagueRules={handleLeagueRules}
            />
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-zinc-950/95 backdrop-blur-md border-t border-white/10">
        <button
          onClick={handleMakePicks}
          className="w-full px-6 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white transition-all shadow-xl shadow-emerald-500/50"
        >
          Make Picks
        </button>
      </div>
    </div>
  );
};

export default LeagueHome;
