import React from 'react'

export function WinnerLoserProp({
  question,
  teamA,
  teamB,
  selectedTeam,
  onSelect,
  isLocked,
  gameStatus,
}) {
  const showScores = gameStatus === 'live' || gameStatus === 'completed'

  function TeamOption({ team }) {
    const isSelected = selectedTeam === team.name

    return (
      <button
        onClick={() => !isLocked && onSelect(team.name)}
        disabled={isLocked}
        className={`w-full p-5 rounded-2xl border-2 transition-all ${
          isSelected
            ? isLocked
              ? 'bg-emerald-500/10 border-emerald-500/50 cursor-not-allowed opacity-60'
              : 'bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-500/30'
            : isLocked
            ? 'bg-white/5 border-white/5 cursor-not-allowed opacity-60'
            : 'bg-white/5 border-white/10 hover:border-emerald-500/50 hover:bg-white/10'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="text-left">
            <div className="text-white text-lg mb-1">
              {team.name}
              {team.isFavorite && <span className="ml-2 text-xs text-gray-500">(Favorite)</span>}
            </div>
            <div className="text-emerald-400 text-sm">+{team.points} pts</div>
          </div>

          {showScores && team.score !== undefined && team.score !== null && (
            <div className="text-3xl text-white ml-4">{team.score}</div>
          )}
        </div>
      </button>
    )
  }

  return (
    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
      <div className="mb-6">
        <h3 className="text-xl text-white mb-2">{question}</h3>
        {showScores && (
          <div className="flex items-center gap-2">
            <div
              className={`px-2 py-1 rounded text-xs ${
                gameStatus === 'live'
                  ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400'
                  : 'bg-gray-500/10 border border-gray-500/30 text-gray-400'
              }`}
            >
              {gameStatus === 'live' ? 'Live' : 'Final'}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <TeamOption team={teamA} />
        <TeamOption team={teamB} />
      </div>
    </div>
  )
}
