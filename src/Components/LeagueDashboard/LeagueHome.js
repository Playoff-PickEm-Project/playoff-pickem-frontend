import React, { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Trophy, Target, Calendar, Clock } from "lucide-react"

import Leaderboard from "./Leaderboard"
import LeagueHeader from "./LeagueHeader"
import StatsRow from "./StatsRow"
import LeagueActionsPanel from "./LeagueActionsPanel"

import { getUsername } from "../../App"

const LeagueHome = () => {
  const { leagueName } = useParams()
  const navigate = useNavigate()
  const username = getUsername()
  const apiUrl = process.env.REACT_APP_API_URL

  const [isCommissioner, setIsCommissioner] = useState(false)
  const [league, setLeague] = useState(null)
  const [loading, setLoading] = useState(true)

  // ✅ for stats
  const [standings, setStandings] = useState([]) // league_players
  const [games, setGames] = useState([])

  useEffect(() => {
    let mounted = true

    const fetchData = async () => {
      try {
        setLoading(true)

        // 1) league + commissioner check
        const leagueRes = await fetch(
          `${apiUrl}/get_league_by_name?leagueName=${encodeURIComponent(leagueName)}`,
          { method: "GET", headers: { "Content-Type": "application/json" }, credentials: "include" }
        )
        if (!leagueRes.ok) throw new Error(`league http ${leagueRes.status}`)
        const leagueData = await leagueRes.json()
        if (!mounted) return
        setLeague(leagueData)

        const userRes = await fetch(
          `${apiUrl}/get_user_by_username?username=${encodeURIComponent(username)}`,
          { method: "GET", headers: { "Content-Type": "application/json" }, credentials: "include" }
        )
        if (!userRes.ok) throw new Error(`user http ${userRes.status}`)
        const userData = await userRes.json()
        if (!mounted) return
        setIsCommissioner(leagueData?.commissioner?.user_id === userData?.id)

        // 2) standings + games for stats
        const [standingsRes, gamesRes] = await Promise.all([
          fetch(
            `${apiUrl}/get_player_standings?leagueName=${encodeURIComponent(leagueName)}`,
            { method: "GET", headers: { "Content-Type": "application/json" }, credentials: "include" }
          ),
          fetch(
            `${apiUrl}/get_games?leagueName=${encodeURIComponent(leagueName)}`,
            { method: "GET", headers: { "Content-Type": "application/json" }, credentials: "include" }
          ),
        ])

        // standings (safe)
        if (standingsRes.ok) {
          const sData = await standingsRes.json()
          const players = Array.isArray(sData?.league_players) ? sData.league_players : []
          if (mounted) setStandings(players)
        } else {
          if (mounted) setStandings([])
        }

        // games (safe)
        if (gamesRes.ok) {
          const gData = await gamesRes.json()
          if (mounted) setGames(Array.isArray(gData) ? gData : [])
        } else {
          if (mounted) setGames([])
        }
      } catch (err) {
        console.error(err)
        alert("Something went wrong")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    if (apiUrl && leagueName && username) fetchData()

    return () => {
      mounted = false
    }
  }, [apiUrl, leagueName, username])

  const commissionerName = league?.commissioner?.name ?? "—"
  const playerCount = league?.league_players?.length ?? "—"
  const joinCode = league?.join_code ?? "—"

  // -----------------------------
  // ✅ Derived stats
  // -----------------------------
  const { yourRank, yourPoints } = useMemo(() => {
    if (!Array.isArray(standings) || standings.length === 0) return { yourRank: "—", yourPoints: "—" }

    const rows = [...standings].map((p) => ({
      name: p?.name ?? p?.username ?? "",
      points: Number(p?.points ?? 0),
    }))

    rows.sort((a, b) => b.points - a.points)

    const me = (username || "").toLowerCase()
    const idx = rows.findIndex((r) => String(r.name).toLowerCase() === me)

    return {
      yourRank: idx === -1 ? "—" : String(idx + 1),
      yourPoints: idx === -1 ? "—" : String(rows[idx].points),
    }
  }, [standings, username])

  const now = Date.now()

  const upcomingGames = useMemo(() => {
    if (!Array.isArray(games)) return []
    return games
      .filter((g) => {
        if (!g?.start_time) return false
        const startMs = new Date(g.start_time).getTime()
        return Number.isFinite(startMs) && startMs > now
      })
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
  }, [games, now])

  const gamesRemaining = useMemo(() => {
    return String(upcomingGames.length)
  }, [upcomingGames])

  const nextLockTime = useMemo(() => {
    const next = upcomingGames[0]
    if (!next?.start_time) return "—"
    try {
      const d = new Date(next.start_time)
      const weekday = d.toLocaleDateString(undefined, { weekday: "short" })
      const monthDay = d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
      const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
      return `${weekday}, ${monthDay} • ${time}`
    } catch {
      return "—"
    }
  }, [upcomingGames])

  const nextUpcomingGame = upcomingGames[0] || null

  const stats = [
    { label: "Your Rank", value: loading ? "—" : yourRank, icon: <Trophy className="w-4 h-4" /> },
    { label: "Your Points", value: loading ? "—" : yourPoints, icon: <Target className="w-4 h-4" /> },
    { label: "Games Remaining", value: loading ? "—" : gamesRemaining, icon: <Calendar className="w-4 h-4" /> },
    { label: "Next Lock Time", value: loading ? "—" : nextLockTime, icon: <Clock className="w-4 h-4" /> },
  ]

  // -----------------------------
  // Handlers
  // -----------------------------
  const handleMakePicks = () =>
    navigate(`/league-home/${encodeURIComponent(leagueName)}/viewGames`)

  const handleViewAllGames = () =>
    navigate(`/league-home/${encodeURIComponent(leagueName)}/viewGames`)

  const handleLeagueRules = () => alert("League rules coming soon.")

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
            {/* ✅ Upcoming games (now real) */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <h3 className="text-xl text-white mb-4">Upcoming Games</h3>

              {loading ? (
                <div className="px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-gray-300 mb-6">
                  Loading…
                </div>
              ) : nextUpcomingGame ? (
                <div className="px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-gray-300 mb-6">
                  <div className="text-white mb-1">
                    {nextUpcomingGame.game_name || "Next Game"}
                  </div>
                  <div className="text-sm text-gray-400">{nextLockTime}</div>
                </div>
              ) : (
                <div className="px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-gray-300 mb-6">
                  <div className="text-white mb-1">No upcoming games</div>
                  <div className="text-sm text-gray-400">Check back later.</div>
                </div>
              )}

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
  )
}

export default LeagueHome
