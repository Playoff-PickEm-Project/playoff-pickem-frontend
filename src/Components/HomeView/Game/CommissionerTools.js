import React from "react"
import { Pencil, CheckCircle } from "lucide-react"

export function CommissionerTools({
  isCommissioner,
  isGraded,
  onEditGame,
  onGradeGame,
}) {
  if (!isCommissioner) return null

  return (
    <div className="p-8 rounded-3xl bg-yellow-500/5 border border-yellow-500/20 backdrop-blur-sm">
      <h2 className="text-3xl text-white text-center mb-6">Commissioner Tools</h2>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <button
          onClick={onEditGame}
          className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
          type="button"
        >
          <Pencil className="w-5 h-5" />
          <span className="text-lg">Edit Game</span>
        </button>

        <button
          onClick={onGradeGame}
          className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
          type="button"
        >
          <CheckCircle className="w-6 h-6" />
          <span className="text-lg">{isGraded ? "Re-Grade" : "Grade"}</span>
        </button>
      </div>

      <div className="mt-6 text-center text-gray-400 text-lg">
        {isGraded
          ? "This game is graded — you can still edit it and re-grade to update results."
          : "You can edit props and grade the game when ready."}
      </div>
    </div>
  )
}
