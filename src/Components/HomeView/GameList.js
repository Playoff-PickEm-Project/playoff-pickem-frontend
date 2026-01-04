import React, { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { Search, Calendar } from "lucide-react"
import GameCard from "./GameCard"
import { getUsername } from "../../App"

const TABS = ["upcoming", "live", "completed", "all"]

const GameList = () => {
  const { leagueName } = useParams()
  const apiUrl = process.env.REACT_APP_API_URL
  const username = getUsername()

  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [searchQuery, setSearchQuery] = useState("")
  const [showOnlyNotPicked, setShowOnlyNotPicked] = useState(false)

  // Store user's answers
  const [winnerLoserAnswers, setWinnerLoserAnswers] = useState({})
  const [overUnderAnswers, setOverUnderAnswers] = useState({})
  const [variableOptionAnswers, setVariableOptionAnswers] = useState({})

  useEffect(() => {
    async function getGamesFromLeague() {
      setLoading(true)
      try {
        const response = await fetch(
          `${apiUrl}/get_games?leagueName=${encodeURIComponent(leagueName)}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        )

        if (!response.ok) {
          console.error("Failed to fetch games:", response.status)
          setGames([])
          return
        }

        const data = await response.json()
        setGames(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Error fetching games:", err)
        setGames([])
      } finally {
        setLoading(false)
      }
    }

    if (leagueName) getGamesFromLeague()
  }, [apiUrl, leagueName])

  // Fetch user's answers
  useEffect(() => {
    async function fetchUserAnswers() {
      if (!apiUrl || !leagueName || !username) return

      try {
        const [wlRes, ouRes, voRes] = await Promise.all([
          fetch(
            `${apiUrl}/retrieve_winner_loser_answers?leagueName=${encodeURIComponent(
              leagueName
            )}&username=${encodeURIComponent(username)}`,
            { method: "GET", headers: { "Content-Type": "application/json" }, credentials: "include" }
          ),
          fetch(
            `${apiUrl}/retrieve_over_under_answers?leagueName=${encodeURIComponent(
              leagueName
            )}&username=${encodeURIComponent(username)}`,
            { method: "GET", headers: { "Content-Type": "application/json" }, credentials: "include" }
          ),
          fetch(
            `${apiUrl}/retrieve_variable_option_answers?leagueName=${encodeURIComponent(
              leagueName
            )}&username=${encodeURIComponent(username)}`,
            { method: "GET", headers: { "Content-Type": "application/json" }, credentials: "include" }
          ),
        ])

        if (wlRes.ok) {
          const wlData = await wlRes.json()
          setWinnerLoserAnswers(wlData || {})
        }
        if (ouRes.ok) {
          const ouData = await ouRes.json()
          setOverUnderAnswers(ouData || {})
        }
        if (voRes.ok) {
          const voData = await voRes.json()
          setVariableOptionAnswers(voData || {})
        }
      } catch (err) {
        console.error("Error fetching user answers:", err)
      }
    }

    fetchUserAnswers()
  }, [apiUrl, leagueName, username])

  const now = Date.now()

  const normalizedGames = useMemo(() => {
    return (games || []).map((g) => {
      const start = g.start_time ? new Date(g.start_time).getTime() : null

      // Determine status: completed if ESPN says game ended OR commissioner graded
      let status = "upcoming"
      if (g.is_completed || g.graded) status = "completed"
      else if (start && start <= now) status = "live"

      return {
        ...g,
        _startMs: start,
        _statusBucket: status,
      }
    })
  }, [games, now])

  const filterByTab = (game) => {
    if (activeTab === "all") return true
    return game._statusBucket === activeTab
  }

  const filterBySearch = (game) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (game.game_name || "").toLowerCase().includes(q)
  }

  const filterByNotPicked = (game) => {
    if (!showOnlyNotPicked) return true

    // Check if user has answered all props for this game
    const wlProps = game.winner_loser_props || []
    const ouProps = game.over_under_props || []
    const voProps = game.variable_option_props || []

    const totalProps = wlProps.length + ouProps.length + voProps.length

    // If no props, consider it as "picked" (nothing to pick)
    if (totalProps === 0) return false

    // Count answered props - use prop_id not id!
    let answeredCount = 0

    wlProps.forEach((prop) => {
      if (winnerLoserAnswers[prop.prop_id] || winnerLoserAnswers[String(prop.prop_id)]) {
        answeredCount++
      }
    })

    ouProps.forEach((prop) => {
      if (overUnderAnswers[prop.prop_id] || overUnderAnswers[String(prop.prop_id)]) {
        answeredCount++
      }
    })

    voProps.forEach((prop) => {
      if (variableOptionAnswers[prop.prop_id] || variableOptionAnswers[String(prop.prop_id)]) {
        answeredCount++
      }
    })

    // Show only games where user hasn't answered all props
    return answeredCount < totalProps
  }

  const filteredGames = normalizedGames
    .filter(filterByTab)
    .filter(filterBySearch)
    .filter(filterByNotPicked)
    .sort((a, b) => {
      if (!a._startMs && !b._startMs) return 0
      if (!a._startMs) return 1
      if (!b._startMs) return -1
      return a._startMs - b._startMs
    })

  return (
    <div className="min-h-screen bg-zinc-950 relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <div className="flex items-start justify-between gap-6">
            <div className="max-w-3xl">
              <h1 className="text-4xl sm:text-5xl text-white mb-2 text-left">Games</h1>
              <p className="text-gray-400 text-lg text-left">
                Make your picks before lock time and track results live.
              </p>
            </div>

            <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm whitespace-nowrap">
              League: {leagueName}
            </div>
          </div>

          <div className="h-px bg-white/10 mt-8 w-full"></div>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/5 border border-white/10">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-xl text-sm transition-all ${
                    activeTab === tab
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="relative w-full lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games..."
                className="w-full pl-12 pr-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowOnlyNotPicked(!showOnlyNotPicked)}
              className={`relative w-12 h-6 rounded-full transition-all ${
                showOnlyNotPicked ? "bg-emerald-500" : "bg-white/10"
              }`}
              type="button"
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  showOnlyNotPicked ? "translate-x-6" : "translate-x-0"
                }`}
              ></div>
            </button>
            <span className="text-gray-400 text-sm">Show only Not Picked</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm animate-pulse"
              >
                <div className="h-5 w-2/3 bg-white/10 rounded mb-4"></div>
                <div className="h-4 w-1/2 bg-white/10 rounded mb-2"></div>
                <div className="h-4 w-1/3 bg-white/10 rounded"></div>
                <div className="h-10 w-full bg-white/10 rounded-xl mt-6"></div>
              </div>
            ))}
          </div>
        ) : filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <GameCard key={game.id} leagueName={leagueName} game={game} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="inline-flex p-4 rounded-full bg-white/5 border border-white/10 mb-4">
                <Calendar className="w-10 h-10 text-gray-500" />
              </div>
              <h2 className="text-2xl text-white mb-3">No Games Found</h2>
              <p className="text-gray-400 mb-6">
                {searchQuery
                  ? "No games match your search. Try a different query."
                  : showOnlyNotPicked
                  ? "You've answered all available games."
                  : "No games available. Check back later."}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("")
                  setActiveTab("all")
                  setShowOnlyNotPicked(false)
                }}
                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all"
                type="button"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GameList
