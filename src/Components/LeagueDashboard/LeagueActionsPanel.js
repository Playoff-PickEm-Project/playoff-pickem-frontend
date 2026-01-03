import React, { useState } from "react";
import { Copy, Check, Gamepad2, FileText, UserPlus } from "lucide-react";

const ActionButton = ({ icon, text, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all"
  >
    <span className="text-emerald-400">{icon}</span>
    <span>{text}</span>
  </button>
);

const LeagueActionsPanel = ({ joinCode, onViewAllGames, onLeagueRules }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyJoinCode = async () => {
    try {
      await navigator.clipboard.writeText(joinCode || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      alert("Could not copy join code.");
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
      <h3 className="text-xl text-white mb-4">League Actions</h3>

      <div className="space-y-3 mb-6">
        <ActionButton
          icon={<Gamepad2 className="w-5 h-5" />}
          text="View All Games"
          onClick={onViewAllGames}
        />
        <ActionButton
          icon={<FileText className="w-5 h-5" />}
          text="League Rules"
          onClick={onLeagueRules}
        />
        <ActionButton
          icon={<UserPlus className="w-5 h-5" />}
          text="Invite Players (Copy Join Code)"
          onClick={handleCopyJoinCode}
        />
      </div>

      <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 border border-white/10">
        <div className="flex-1">
          <div className="text-sm text-gray-400 mb-1">Join Code</div>
          <code className="text-emerald-400 font-mono text-lg">
            {joinCode || "—"}
          </code>
        </div>

        <button
          onClick={handleCopyJoinCode}
          className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all"
          title="Copy join code"
        >
          {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default LeagueActionsPanel;
