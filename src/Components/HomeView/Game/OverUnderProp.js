import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

export function OverUnderProp({
  playerName,
  statType,
  line,
  currentValue,
  overPoints,
  underPoints,
  selectedOption,
  onSelect,
  isLocked,
  gameStatus,
}) {
  const showLiveStats = (gameStatus === 'live' || gameStatus === 'completed') && currentValue !== undefined && currentValue !== null
  const progress = showLiveStats ? Math.min((currentValue / line) * 100, 100) : 0

  return (
    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
      <div className="mb-6">
        <h3 className="text-xl text-white mb-2">
          {playerName} {statType}
        </h3>
        <div className="text-gray-400 text-sm">Line: {line}</div>
      </div>

      {showLiveStats && (
        <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">Current Progress</span>
            <span className="text-2xl text-white">{currentValue}</span>
          </div>

          <div className="relative w-full h-3 rounded-full bg-white/5 overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                currentValue >= line ? 'bg-emerald-500' : 'bg-yellow-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>0</span>
            <span>{line}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => !isLocked && onSelect('over')}
          disabled={isLocked}
          className={`p-5 rounded-2xl border-2 transition-all ${
            isLocked
              ? 'bg-white/5 border-white/5 cursor-not-allowed opacity-60'
              : selectedOption === 'over'
              ? 'bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-500/30'
              : 'bg-white/5 border-white/10 hover:border-emerald-500/50 hover:bg-white/10'
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <TrendingUp className={`w-6 h-6 ${selectedOption === 'over' ? 'text-emerald-400' : 'text-gray-400'}`} />
            <div className="text-white">Over</div>
            <div className="text-emerald-400 text-sm">+{overPoints} pts</div>
          </div>
        </button>

        <button
          onClick={() => !isLocked && onSelect('under')}
          disabled={isLocked}
          className={`p-5 rounded-2xl border-2 transition-all ${
            isLocked
              ? 'bg-white/5 border-white/5 cursor-not-allowed opacity-60'
              : selectedOption === 'under'
              ? 'bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-500/30'
              : 'bg-white/5 border-white/10 hover:border-emerald-500/50 hover:bg-white/10'
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <TrendingDown className={`w-6 h-6 ${selectedOption === 'under' ? 'text-emerald-400' : 'text-gray-400'}`} />
            <div className="text-white">Under</div>
            <div className="text-emerald-400 text-sm">+{underPoints} pts</div>
          </div>
        </button>
      </div>
    </div>
  )
}
