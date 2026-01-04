import React from "react"
import { Clock, Lock, CheckCircle } from "lucide-react"

export function GameStatusBar({ matchup, gameTime, status, lockTime, isLocked }) {
  // 🔒 Hard guard: never allow unknown status
  const normalizedStatus =
    status === "completed" || status === "live" || status === "upcoming" ? status : "live"

  const statusConfig = {
    upcoming: {
      label: "Upcoming",
      className: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    },
    live: {
      label: "Live",
      className: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
    },
    completed: {
      label: "Completed",
      className: "bg-gray-500/10 border-gray-500/30 text-gray-400",
    },
  }

  const current = statusConfig[normalizedStatus]

  return (
    <div className="sticky top-4 z-10 p-6 rounded-3xl bg-zinc-900/95 border border-white/10 backdrop-blur-xl shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* ✅ force left column to take full width + left align */}
        <div className="flex-1 min-w-0 text-left">
          <h2 className="text-2xl text-white mb-1 text-left truncate">{matchup}</h2>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-gray-400 text-sm">{gameTime}</span>

            <div className={`px-3 py-1 rounded-full text-xs border ${current.className}`}>
              {current.label}
            </div>
          </div>
        </div>

        <div>
          {normalizedStatus === "completed" ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-500/10 border border-gray-500/30 text-gray-400">
              <CheckCircle className="w-4 h-4" />
              <span>Game Graded</span>
            </div>
          ) : isLocked ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
              <Lock className="w-4 h-4" />
              <span>Answers Locked</span>
            </div>
          ) : lockTime ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Clock className="w-4 h-4" />
              <span>Locks in {lockTime}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
