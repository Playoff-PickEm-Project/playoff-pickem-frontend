import React, { useState } from "react"
import { ArrowLeft, Trophy, User, Loader2, Info } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { getUsername } from "../../App"

const CreateLeague = () => {
  const [leagueName, setLeagueName] = useState("")
  const [playerName, setPlayerName] = useState("")
  const [leagueNameError, setLeagueNameError] = useState("")
  const [playerNameError, setPlayerNameError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Toast state (same style as your login page)
  const [toast, setToast] = useState(null)
  const showToast = (type, message) => {
    setToast({ type, message })
    clearTimeout(showToast._timeout)
    showToast._timeout = setTimeout(() => setToast(null), 3000)
  }

  const username = getUsername()
  const navigate = useNavigate()
  const apiUrl = process.env.REACT_APP_API_URL

  const handleLeagueNameChange = (e) => {
    setLeagueName(e.target.value)
    setLeagueNameError("")
  }

  const handlePlayerNameChange = (e) => {
    setPlayerName(e.target.value)
    setPlayerNameError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLeagueNameError("")
    setPlayerNameError("")

    if (!leagueName.trim()) {
      setLeagueNameError("League name is required")
      return
    }

    if (!playerName.trim()) {
      setPlayerNameError("Player name is required")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${apiUrl}/create_league`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          leagueName: leagueName.trim(),
          username,
          playerName: playerName.trim(),
        }),
      })

      if (response.ok) {
        showToast("success", "League Created Successfully!")

        setTimeout(() => {
          navigate("/league-list")
        }, 900)

        return
      }

      // Try to read a server message if available
      let serverMsg = ""
      try {
        const data = await response.json()
        serverMsg = data?.message || data?.error || ""
      } catch {}

      const msg = (serverMsg || "").toLowerCase()

      // Best-effort mapping
      if (msg.includes("league") || msg.includes("name") || msg.includes("taken") || msg.includes("exists")) {
        setLeagueNameError(serverMsg || "League name is already taken")
      } else if (msg.includes("player") || msg.includes("user")) {
        setPlayerNameError(serverMsg || "Player name is not valid")
      } else {
        showToast("error", serverMsg || "Something went wrong. Please try again.")
      }
    } catch (err) {
      console.error(err)
      showToast("error", "Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = leagueName.trim() !== "" && playerName.trim() !== ""

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-950">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl" />
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100]">
          <div
            className={`rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-md ${
              toast.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-100"
                : "bg-red-500/15 border-red-500/30 text-red-100"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-sm">{toast.message}</span>
              <button
                onClick={() => setToast(null)}
                className="ml-2 text-white/60 hover:text-white transition"
                type="button"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm group z-20"
        type="button"
      >
        <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back</span>
      </button>

      {/* Card */}
      <div className="relative w-full max-w-[480px] p-8 md:p-10 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl">
        <div className="mb-8">
          <h1 className="mb-3 text-4xl text-white">Create a League</h1>
          <p className="text-gray-400">
            Pick a league name and choose your commissioner display name.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* League Name */}
          <div className="space-y-2">
            <label htmlFor="leagueName" className="block text-white">
              League Name
            </label>

            <div className="relative">
              <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-500 pointer-events-none" />
              <input
                id="leagueName"
                type="text"
                value={leagueName}
                onChange={handleLeagueNameChange}
                disabled={isLoading}
                placeholder="Enter league name"
                className={`w-full pl-12 pr-5 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-500 backdrop-blur-sm focus:outline-none transition-all ${
                  leagueNameError
                    ? "border-red-500/40 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20"
                    : "border-white/10 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                } ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
              />
            </div>

            {leagueNameError ? (
              <p className="text-red-400 text-sm">{leagueNameError}</p>
            ) : (
              <p className="text-gray-500 text-sm">This will be shown to everyone in the league.</p>
            )}
          </div>

          {/* Player Name */}
          <div className="space-y-2">
            <label htmlFor="playerName" className="block text-white">
              Your Name (Commissioner)
            </label>

            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-500 pointer-events-none" />
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={handlePlayerNameChange}
                disabled={isLoading}
                placeholder="Enter your display name"
                className={`w-full pl-12 pr-5 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-500 backdrop-blur-sm focus:outline-none transition-all ${
                  playerNameError
                    ? "border-red-500/40 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20"
                    : "border-white/10 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                } ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
              />
            </div>

            {playerNameError ? (
              <p className="text-red-400 text-sm">{playerNameError}</p>
            ) : (
              <p className="text-gray-500 text-sm">This is how you’ll appear on the leaderboard.</p>
            )}
          </div>

          {/* Info */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
            <Info className="size-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-400">
              You’ll be the commissioner by default and can create games once the league is made.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`w-full px-6 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
              !isFormValid || isLoading
                ? "bg-white/5 text-gray-500 cursor-not-allowed"
                : "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500 hover:text-white hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02]"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                <span>Creating…</span>
              </>
            ) : (
              <span>Create League</span>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateLeague
