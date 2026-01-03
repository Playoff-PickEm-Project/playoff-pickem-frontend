import React from 'react'
import { Edit2, CheckCircle } from 'lucide-react'

export function CommissionerTools({ isCommissioner, isGraded, onEditGame, onGradeGame }) {
  if (!isCommissioner) return null

  return (
    <div className="p-6 rounded-3xl bg-yellow-500/5 border border-yellow-500/20 backdrop-blur-sm">
      <h3 className="text-xl text-white mb-4">Commissioner Tools</h3>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onEditGame}
          disabled={isGraded}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all ${
            isGraded
              ? 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed'
              : 'bg-yellow-500/10 hover:bg-yellow-500 border border-yellow-500/30 text-yellow-400 hover:text-white'
          }`}
        >
          <Edit2 className="w-5 h-5" />
          <span>Edit Game</span>
        </button>

        <button
          onClick={onGradeGame}
          disabled={isGraded}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all ${
            isGraded
              ? 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed'
              : 'bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 text-emerald-400 hover:text-white'
          }`}
        >
          <CheckCircle className="w-5 h-5" />
          <span>{isGraded ? 'Graded' : 'Grade Game'}</span>
        </button>
      </div>

      {isGraded && (
        <p className="mt-3 text-sm text-gray-400">This game has been graded and can no longer be edited.</p>
      )}
    </div>
  )
}
