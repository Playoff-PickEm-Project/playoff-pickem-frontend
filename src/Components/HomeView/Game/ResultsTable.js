import React from 'react';
import { CheckCircle2, XCircle, Minus } from 'lucide-react';

export default function ResultsTable({
  question,
  results,
  correctAnswer,
  playerOrder = [],
  align = 'left', // 'left' or 'center'
  liveStats = null, // Live stats data for this prop
  propType = null, // 'winner_loser', 'over_under', or 'variable_option'
  gameStatus = null, // 'not_started', 'live', or 'completed'
}) {
  const isCenter = align === 'center';

  const thAlign = isCenter ? 'text-center' : 'text-left';
  const tdAlign = isCenter ? 'text-center' : 'text-left';

  const showLiveStats = (gameStatus === 'live' || gameStatus === 'completed') && liveStats;

  // For over/under props, calculate progress
  const overUnderProgress = React.useMemo(() => {
    if (propType !== 'over_under' || !liveStats?.current_value || !liveStats?.line_value) {
      return null;
    }
    const progress = Math.min((liveStats.current_value / liveStats.line_value) * 100, 100);
    return {
      current: liveStats.current_value,
      line: liveStats.line_value,
      progress,
      isOver: liveStats.current_value >= liveStats.line_value,
    };
  }, [propType, liveStats]);

  // Order results to match the playerOrder (same order as game form / league list)
  const orderedResults = React.useMemo(() => {
    if (!Array.isArray(results)) return [];

    // If no order provided, keep incoming order
    if (!Array.isArray(playerOrder) || playerOrder.length === 0) return results;

    const indexMap = new Map();
    playerOrder.forEach((name, idx) => indexMap.set(String(name).toLowerCase(), idx));

    // Sort by index in playerOrder; unknown players go to the end in original order
    return [...results]
      .map((r, originalIdx) => ({
        ...r,
        __orderIdx: indexMap.has(String(r.playerName).toLowerCase())
          ? indexMap.get(String(r.playerName).toLowerCase())
          : Number.MAX_SAFE_INTEGER,
        __originalIdx: originalIdx,
      }))
      .sort((a, b) => {
        if (a.__orderIdx !== b.__orderIdx) return a.__orderIdx - b.__orderIdx;
        return a.__originalIdx - b.__originalIdx;
      })
      .map(({ __orderIdx, __originalIdx, ...rest }) => rest);
  }, [results, playerOrder]);

  const ResultBadge = ({ isCorrect }) => {
    if (isCorrect === true) {
      return (
        <div className={`inline-flex items-center gap-1 text-emerald-400 ${isCenter ? 'justify-center' : ''}`}>
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm">Correct</span>
        </div>
      );
    }
    if (isCorrect === false) {
      return (
        <div className={`inline-flex items-center gap-1 text-red-400 ${isCenter ? 'justify-center' : ''}`}>
          <XCircle className="w-5 h-5" />
          <span className="text-sm">Incorrect</span>
        </div>
      );
    }
    return (
      <div className={`inline-flex items-center gap-1 text-gray-500 ${isCenter ? 'justify-center' : ''}`}>
        <Minus className="w-5 h-5" />
        <span className="text-sm">Not Graded</span>
      </div>
    );
  };

  return (
    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
      <div className={isCenter ? 'text-center' : 'text-left'}>
        <h3 className="text-xl text-white mb-4">{question}</h3>

        {/* Live Stats Display - Over/Under Progress Bar */}
        {showLiveStats && propType === 'over_under' && overUnderProgress && (
          <div className="mb-4 p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">Current Progress</span>
              <span className="text-2xl text-white">{overUnderProgress.current}</span>
            </div>

            <div className="relative w-full h-3 rounded-full bg-white/5 overflow-hidden">
              <div
                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                  overUnderProgress.isOver ? 'bg-emerald-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${overUnderProgress.progress}%` }}
              />
            </div>

            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>0</span>
              <span>{overUnderProgress.line}</span>
            </div>
          </div>
        )}

        {/* Live Stats Display - Winner/Loser Team Scores */}
        {showLiveStats && propType === 'winner_loser' && liveStats.team_a_name && liveStats.team_b_name && (
          <div className="mb-4 p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
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

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <span className="text-white text-lg">{liveStats.team_a_name}</span>
                <span className="text-white text-2xl font-bold">
                  {liveStats.team_a_score !== null && liveStats.team_a_score !== undefined ? liveStats.team_a_score : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <span className="text-white text-lg">{liveStats.team_b_name}</span>
                <span className="text-white text-2xl font-bold">
                  {liveStats.team_b_score !== null && liveStats.team_b_score !== undefined ? liveStats.team_b_score : '-'}
                </span>
              </div>
            </div>
          </div>
        )}

        {correctAnswer && (
          <div className={`mb-4 ${isCenter ? 'flex justify-center' : ''}`}>
            <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 inline-block">
              Correct Answer: {correctAnswer}
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className={`${thAlign} py-3 px-4 text-gray-400 text-sm`}>Player</th>
              <th className={`${thAlign} py-3 px-4 text-gray-400 text-sm`}>Answer</th>
              <th className={`${thAlign} py-3 px-4 text-gray-400 text-sm`}>Result</th>
            </tr>
          </thead>

          <tbody>
            {orderedResults.map((result, idx) => (
              <tr key={idx} className="border-b border-white/5 last:border-0">
                <td className={`${tdAlign} py-3 px-4 text-white`}>{result.playerName}</td>
                <td className={`${tdAlign} py-3 px-4 text-gray-300`}>{result.answer}</td>
                <td className={`${tdAlign} py-3 px-4`}>
                  <ResultBadge isCorrect={result.isCorrect} />
                </td>
              </tr>
            ))}

            {orderedResults.length === 0 && (
              <tr>
                <td className={`${tdAlign} py-6 px-4 text-gray-500`} colSpan={3}>
                  No results yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
