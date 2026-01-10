import React, { useState } from "react"
import { ArrowLeft, Hash, User, Loader2, Info } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { getUsername } from "../../App"

const JoinLeague = () => {
  const [joinCode, setJoinCode] = useState("")
  const [playerName, setPlayerName] = useState("")
  const [joinCodeError, setJoinCodeError] = useState("")
  const [playerNameError, setPlayerNameError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [joinCodeValid, setJoinCodeValid] = useState(false)

  // Toast state
  const [toast, setToast] = useState(null)
  const showToast = (type, message) => {
    setToast({ type, message })
    clearTimeout(showToast._timeout)
    showToast._timeout = setTimeout(() => setToast(null), 3000)
  }

  const username = getUsername()
  const navigate = useNavigate()
  const apiUrl = process.env.REACT_APP_API_URL

  const handleJoinCodeChange = (e) => {
    setJoinCode(e.target.value)
    setJoinCodeError("")
    setJoinCodeValid(false)
  }

  const handlePlayerNameChange = (e) => {
    setPlayerName(e.target.value)
    setPlayerNameError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setJoinCodeError("")
    setPlayerNameError("")
    setJoinCodeValid(false)

    if (!joinCode.trim()) {
      setJoinCodeError("Join code is required")
      return
    }

    if (!playerName.trim()) {
      setPlayerNameError("Player name is required")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${apiUrl}/join_league`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          joinCode: joinCode.trim(),
          username,
          playerName: playerName.trim(),
        }),
      })

      if (response.ok) {
        setJoinCodeValid(true)
        showToast("success", "Joined Successfully!")

        setTimeout(() => {
          navigate("/league-list")
        }, 900)

        return
      }

      let serverMsg = ""
      try {
        const data = await response.json()
        serverMsg = data?.message || data?.error || ""
      } catch {}

      const msg = serverMsg.toLowerCase()

      if (msg.includes("name") || msg.includes("player")) {
        setPlayerNameError(serverMsg || "Player name already exists in this league")
      } else if (msg.includes("code") || msg.includes("join")) {
        setJoinCodeError(serverMsg || "Invalid join code")
      } else {
        setJoinCodeError("Join code is invalid or player name already exists")
      }
    } catch (err) {
      console.error(err)
      setJoinCodeError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = joinCode.trim() !== "" && playerName.trim() !== ""

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
        <span>Back to leagues</span>
      </button>

      {/* Card */}
      <div className="relative w-full max-w-[480px] p-8 md:p-10 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl">
        <div className="mb-8">
          <h1 className="mb-3 text-4xl text-white">Join a League</h1>
          <p className="text-gray-400">
            Enter your join code and choose a display name for this league.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Join Code */}
          <div className="space-y-2">
            <label className="block text-white">Join Code</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
              <input
                value={joinCode}
                onChange={handleJoinCodeChange}
                disabled={isLoading}
                className={`w-full pl-12 pr-5 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-500 focus:outline-none transition-all ${
                  joinCodeError
                    ? "border-red-500/40"
                    : joinCodeValid
                    ? "border-emerald-500/40"
                    : "border-white/10 focus:border-emerald-500/50"
                }`}
                placeholder="Enter code"
              />
            </div>
            {joinCodeError ? (
              <p className="text-red-400 text-sm">{joinCodeError}</p>
            ) : (
              <p className="text-gray-500 text-sm">Ask the commissioner for the code.</p>
            )}
          </div>

          {/* Player Name */}
          <div className="space-y-2">
            <label className="block text-white">Player Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
              <input
                value={playerName}
                onChange={handlePlayerNameChange}
                disabled={isLoading}
                className={`w-full pl-12 pr-5 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-500 focus:outline-none transition-all ${
                  playerNameError
                    ? "border-red-500/40"
                    : "border-white/10 focus:border-emerald-500/50"
                }`}
                placeholder="Enter your display name"
              />
            </div>
            {playerNameError ? (
              <p className="text-red-400 text-sm">{playerNameError}</p>
            ) : (
              <p className="text-gray-500 text-sm">
                This is how you'll appear on the leaderboard.
              </p>
            )}
          </div>

          {/* Info */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
            <Info className="size-5 text-emerald-400 mt-0.5" />
            <p className="text-sm text-gray-400">
              Joining a league does not create an account. Your account is your username.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`w-full px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition ${
              !isFormValid || isLoading
                ? "bg-white/5 text-gray-500 cursor-not-allowed"
                : "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500 hover:text-white hover:shadow-lg hover:shadow-emerald-500/30"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Joining…
              </>
            ) : (
              "Join League"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default JoinLeague
