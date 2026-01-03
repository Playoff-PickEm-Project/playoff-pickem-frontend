import React from 'react';
import { CheckCircle2, XCircle, Minus } from 'lucide-react';

export default function ResultsTable({
  question,
  results,
  correctAnswer,
  playerOrder = [],
  align = 'left', // 'left' or 'center'
}) {
  const isCenter = align === 'center';

  const thAlign = isCenter ? 'text-center' : 'text-left';
  const tdAlign = isCenter ? 'text-center' : 'text-left';

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
