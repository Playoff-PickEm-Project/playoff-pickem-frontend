import React from 'react'

export function VariableOptionProp({ question, options, selectedOption, onSelect, isLocked }) {
  const sortedOptions = [...options].sort((a, b) => b.points - a.points)

  return (
    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
      <h3 className="text-xl text-white mb-6">{question}</h3>

      <div className="space-y-3">
        {sortedOptions.map((option) => {
          const isSelected = selectedOption === option.id

          return (
            <button
              key={option.id}
              onClick={() => !isLocked && onSelect(option.id)}
              disabled={isLocked}
              className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                isLocked
                  ? 'bg-white/5 border-white/5 cursor-not-allowed opacity-60'
                  : isSelected
                  ? 'bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-500/30'
                  : 'bg-white/5 border-white/10 hover:border-emerald-500/50 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-emerald-500' : 'border-white/30'
                    }`}
                  >
                    {isSelected && <div className="w-3 h-3 rounded-full bg-emerald-500" />}
                  </div>
                  <span className="text-white">{option.text}</span>
                </div>
                <span className="text-emerald-400 text-sm">+{option.points} pts</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
