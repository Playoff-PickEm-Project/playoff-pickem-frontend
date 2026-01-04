import React from "react";
import { Trophy } from "lucide-react";

const EmptyState = ({ onCreateLeague, onJoinLeague }) => {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="p-6 rounded-full bg-white/5 border border-white/10">
            <Trophy className="w-12 h-12 text-emerald-400" />
          </div>
        </div>

        <h3 className="text-2xl text-white mb-3">No leagues yet</h3>
        <p className="text-gray-400 mb-8">
          Create a league or join one with a code to start making your playoff
          picks.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onCreateLeague}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white transition-all hover:shadow-xl hover:shadow-emerald-500/50 hover:scale-[1.02]"
          >
            Create League
          </button>
          <button
            onClick={onJoinLeague}
            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-emerald-500/50 transition-all"
          >
            Join League
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
