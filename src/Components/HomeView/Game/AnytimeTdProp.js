import React from 'react'

/**
 * AnytimeTdProp Component
 *
 * Displays an Anytime TD Scorer prop where users select which player they think
 * will score touchdowns. Each option has:
 * - player_name: The NFL player's name
 * - td_line: The TD threshold (0.5 = 1+ TD, 1.5 = 2+ TDs, etc.)
 * - points: Points awarded if the player hits their line
 * - current_tds: Live count of TDs scored (if game is in progress/completed)
 *
 * @param {string} question - The prop question text
 * @param {Array} options - Array of player options with player_name, td_line, points, current_tds
 * @param {string} selectedOption - The player_name of the currently selected option
 * @param {Function} onSelect - Callback when user selects an option (receives player_name)
 * @param {boolean} isLocked - Whether the game has started (prop is locked)
 * @param {string} gameStatus - Game status ('pre', 'live', 'completed')
 */
export function AnytimeTdProp({
  question,
  options = [],
  selectedOption,
  onSelect,
  isLocked,
  gameStatus = 'pre'
}) {
  // Sort options by points descending (higher risk/reward at top)
  const sortedOptions = [...options].sort((a, b) => b.points - a.points)

  /**
   * Format TD line for display
   * 0.5 → "1+ TD"
   * 1.5 → "2+ TDs"
   * 2.5 → "3+ TDs"
   */
  const formatTdLine = (tdLine) => {
    const minTds = Math.ceil(tdLine)
    return `${minTds}+ TD${minTds > 1 ? 's' : ''}`
  }

  /**
   * Check if player has hit their TD line
   */
  const hasHitLine = (option) => {
    return option.current_tds !== null &&
           option.current_tds !== undefined &&
           option.current_tds >= option.td_line
  }

  /**
   * Get display styling for live TD count
   */
  const getTdCountStyle = (option) => {
    if (gameStatus === 'pre') return 'text-white/50'
    if (hasHitLine(option)) return 'text-emerald-400 font-semibold'
    return 'text-orange-400'
  }

  const showLiveStats = gameStatus === 'live' || gameStatus === 'completed'

  return (
    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
      <h3 className="text-xl text-white mb-6">{question}</h3>

      <div className="space-y-3">
        {sortedOptions.map((option) => {
          const isSelected = selectedOption === option.player_name
          const hitLine = hasHitLine(option)

          return (
            <button
              key={option.id || option.player_name}
              onClick={() => !isLocked && onSelect(option.player_name)}
              disabled={isLocked}
              className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
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
                {/* Left side: Selection indicator + Player info */}
                <div className="flex items-center gap-3 flex-1">
                  {/* Radio button indicator */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'border-emerald-500' : 'border-white/30'
                    }`}
                  >
                    {isSelected && <div className="w-3 h-3 rounded-full bg-emerald-500" />}
                  </div>

                  {/* Player name and TD line */}
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="text-white font-medium">{option.player_name}</span>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-white/60">{formatTdLine(option.td_line)}</span>

                      {/* Live TD count */}
                      {showLiveStats && (
                        <span className={getTdCountStyle(option)}>
                          {option.current_tds ?? 0} TD{(option.current_tds ?? 0) !== 1 ? 's' : ''}
                          {hitLine && ' ✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Points */}
                <span className="text-emerald-400 text-sm font-medium flex-shrink-0 ml-3">
                  +{option.points} pts
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Helper text explaining the prop */}
      {!isLocked && (
        <p className="text-white/50 text-sm mt-4 text-center">
          Select a player - earn points if they hit their TD line
        </p>
      )}
    </div>
  )
}
