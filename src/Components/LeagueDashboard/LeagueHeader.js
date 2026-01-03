import React from "react";

const LeagueHeader = ({ leagueName, commissionerName, playerCount, isCommissioner }) => {
  return (
    <div className="mb-8 sm:mb-12">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-4xl sm:text-5xl text-white mb-3">
            Welcome to {leagueName}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-gray-400">
            <span>
              Commissioner:{" "}
              <span className="text-emerald-400">{commissionerName || "—"}</span>
            </span>
            <span>•</span>
            <span>
              Players: <span className="text-white">{playerCount ?? "—"}</span>
            </span>
          </div>
        </div>

        {isCommissioner && (
          <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm whitespace-nowrap">
            Commissioner View
          </div>
        )}
      </div>

      <div className="h-px bg-white/10 mt-8" />
    </div>
  );
};

export default LeagueHeader;
