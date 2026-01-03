import React, { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { Search, Calendar } from "lucide-react"
import GameCard from "./GameCard"

const TABS = ["upcoming", "live", "completed", "all"]

const GameList = () => {
  const { leagueName } = useParams()
  const apiUrl = process.env.REACT_APP_API_URL

  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [searchQuery, setSearchQuery] = useState("")
  const [showOnlyNotPicked, setShowOnlyNotPicked] = useState(false)

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

  const now = Date.now()

  const normalizedGames = useMemo(() => {
    return (games || []).map((g) => {
      const start = g.start_time ? new Date(g.start_time).getTime() : null

      // ✅ bucket by commissioner grading first
      let status = "upcoming"
      if (g.graded) status = "completed"
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
    return true
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
            <span className="text-gray-600 text-xs">(placeholder)</span>
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
              <h2 className="text-2xl text-white mb-3">No Games Available</h2>
              <p className="text-gray-400 mb-6">
                {searchQuery
                  ? "No games match your search. Try a different query."
                  : "The commissioner hasn't created any games yet."}
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
