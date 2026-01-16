import React, { useMemo } from "react"
import { Link } from "react-router-dom"
import { Clock, Trophy, Radio, CalendarDays, CheckCircle2, ListChecks } from "lucide-react"

const formatDate = (iso) => {
  if (!iso) return "TBD"
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  } catch {
    return "TBD"
  }
}

const formatTime = (iso) => {
  if (!iso) return ""
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    })
  } catch {
    return ""
  }
}

const getCountdown = (iso) => {
  if (!iso) return null
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return null
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const remH = hours % 24
  const remM = minutes % 60

  if (days > 0) return `${days}d ${remH}h`
  if (hours > 0) return `${hours}h ${remM}m`
  return `${minutes}m`
}

const statusMeta = (game) => {
  const now = Date.now()
  const startMs = game.start_time ? new Date(game.start_time).getTime() : null

  // ✅ your app's meaning of "completed"
  if (game.graded) {
    return {
      label: "Completed",
      pill: "bg-gray-500/10 border-gray-500/30 text-gray-300",
      icon: CheckCircle2,
    }
  }

  // optional: keep ESPN final as "Final" (separate concept)
  if (game.is_completed) {
    return {
      label: "Final",
      pill: "bg-white/5 border-white/10 text-gray-300",
      icon: Trophy,
    }
  }

  if (startMs && startMs <= now) {
    return {
      label: "Live",
      pill: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      icon: Radio,
    }
  }

  return {
    label: "Upcoming",
    pill: "bg-white/5 border-white/10 text-gray-300",
    icon: CalendarDays,
  }
}

const GameCard = ({ leagueName, game }) => {
  const { label, pill, icon: Icon } = useMemo(() => statusMeta(game), [game])

  const dateLabel = formatDate(game.start_time)
  const timeLabel = formatTime(game.start_time)
  const countdown = getCountdown(game.start_time)

  const scoreLine =
    game.team_a_score !== null &&
    game.team_a_score !== undefined &&
    game.team_b_score !== null &&
    game.team_b_score !== undefined

  return (
    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        {/* ✅ force left column to take full width + left align */}
        <div className="min-w-0 flex-1 text-left">
          <h3 className="text-white text-lg font-medium truncate text-left">
            {game.game_name || "Game"}
          </h3>

          <div className="mt-1 text-sm text-gray-400 flex items-center gap-2 text-left">
            <span>{dateLabel}</span>
            {timeLabel && (
              <>
                <span className="text-gray-600">•</span>
                <span>{timeLabel}</span>
              </>
            )}
          </div>
        </div>

        <div className={`shrink-0 px-3 py-1 rounded-full border text-xs flex items-center gap-1 ${pill}`}>
          <Icon className="w-3.5 h-3.5" />
          <span>{label}</span>
        </div>
      </div>

      {/* Mid row: countdown / score / prop selection */}
      <div className="space-y-3">
        {label === "Upcoming" && (
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <ListChecks className="w-4 h-4 text-blue-400" />
            <span>Answer props + select {game.prop_limit ?? 2} optional</span>
          </div>
        )}

        {label === "Upcoming" && countdown && (
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Locks in</span>
            <span className="text-emerald-400 font-medium">{countdown}</span>
          </div>
        )}

        {(label === "Live" || label === "Final") && scoreLine && (
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-sm text-gray-400 mb-1">
              {label === "Final" ? "Final Score" : "Live Score"}
            </div>
            <div className="text-white font-semibold">
              {game.team_a_score} - {game.team_b_score}
            </div>
          </div>
        )}

        {!scoreLine && (label === "Live" || label === "Final") && (
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-gray-400">
            Score not available yet
          </div>
        )}
      </div>

      {/* CTA */}
      <Link
        to={`/league-home/${leagueName}/viewGames/${game.id}`}
        className="mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white transition-all hover:shadow-xl hover:shadow-emerald-500/30"
      >
        {label === "Upcoming" ? "Make Picks" : "View Game"}
      </Link>
    </div>
  )
}

export default GameCard
