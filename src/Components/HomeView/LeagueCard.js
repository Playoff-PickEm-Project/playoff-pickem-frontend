import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Users, Shield } from "lucide-react";

const LeagueCard = ({ league }) => {
  const leagueName = league?.league_name ?? "League";
  const commissioner = league?.commissioner?.name ?? "—";
  const playerCount = league?.league_players?.length ?? 0;
  const joinCode = league?.join_code ?? "—";

  return (
    <div className="w-full">
      <div className="group p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-sm transition-all duration-300 hover:bg-white/10 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1">
        <div className="flex flex-col gap-4">
          {/* League Name */}
          <h3 className="text-white text-2xl font-medium tracking-tight">
            {leagueName}
          </h3>

          {/* Info */}
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>
                Commissioner:{" "}
                <span className="text-gray-200">{commissioner}</span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-400">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>
                Players: <span className="text-gray-200">{playerCount}</span>
              </span>
            </div>
          </div>

          {/* Join Code */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Join Code:</span>
            <code className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-sm">
              {joinCode}
            </code>
          </div>

          {/* View Link */}
          <Link
            to={`/league-home/${encodeURIComponent(leagueName)}`}
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors mt-2"
          >
            <span>View League</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LeagueCard;
