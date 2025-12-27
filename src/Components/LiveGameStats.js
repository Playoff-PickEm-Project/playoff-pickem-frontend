import React, { useEffect, useState } from "react";

/**
 * LiveGameStats Component
 *
 * Displays live stats for a game including current prop values.
 * Fetches data from the backend polling system and updates every 30 seconds.
 */
const LiveGameStats = ({ gameId }) => {
  const [liveStats, setLiveStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL;

  // Fetch live stats from backend
  const fetchLiveStats = async () => {
    try {
      const response = await fetch(`${apiUrl}/game/${gameId}/live_stats`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setLiveStats(data);
        setError(null);
      } else {
        setError("Failed to load live stats");
      }
    } catch (err) {
      setError("Error fetching live stats");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats on mount and set up polling
  useEffect(() => {
    fetchLiveStats();

    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchLiveStats, 30000);

    return () => clearInterval(interval);
  }, [gameId]);

  if (loading) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-600">Loading live stats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!liveStats) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Game Status */}
      <div className="p-4 bg-blue-100 rounded-lg">
        <h3 className="text-lg font-bold text-blue-900">
          {liveStats.game_name}
        </h3>
        <div className="flex items-center space-x-2 mt-2">
          {liveStats.is_completed ? (
            <span className="px-2 py-1 bg-green-500 text-white text-sm rounded">
              Final
            </span>
          ) : liveStats.is_polling ? (
            <span className="px-2 py-1 bg-yellow-500 text-white text-sm rounded">
              Live
            </span>
          ) : (
            <span className="px-2 py-1 bg-gray-500 text-white text-sm rounded">
              Not Started
            </span>
          )}
          {liveStats.team_a_score !== null && liveStats.team_b_score !== null && (
            <span className="text-lg font-semibold">
              {liveStats.team_a_score} - {liveStats.team_b_score}
            </span>
          )}
        </div>
      </div>

      {/* Over/Under Props Live Stats */}
      {liveStats.over_under_props && liveStats.over_under_props.length > 0 && (
        <div className="p-4 bg-white rounded-lg shadow">
          <h4 className="text-md font-semibold mb-3">Player Props</h4>
          <div className="space-y-2">
            {liveStats.over_under_props.map((prop) => (
              <div key={prop.prop_id} className="border-b pb-2">
                <p className="text-sm font-medium text-gray-700">
                  {prop.question}
                </p>
                {prop.player_name && prop.stat_type && (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-600">
                      {prop.player_name} - {prop.stat_type.replace('_', ' ')}
                    </span>
                    <div className="flex items-center space-x-2">
                      {prop.current_value !== null ? (
                        <span className="text-lg font-bold text-blue-600">
                          {prop.current_value}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">
                          No data yet
                        </span>
                      )}
                      {prop.line_value !== null && (
                        <span className="text-sm text-gray-500">
                          / {prop.line_value}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Winner/Loser Props Live Stats */}
      {liveStats.winner_loser_props && liveStats.winner_loser_props.length > 0 && (
        <div className="p-4 bg-white rounded-lg shadow">
          <h4 className="text-md font-semibold mb-3">Game Winner</h4>
          <div className="space-y-2">
            {liveStats.winner_loser_props.map((prop) => (
              <div key={prop.prop_id} className="border-b pb-2">
                <p className="text-sm font-medium text-gray-700">
                  {prop.question}
                </p>
                {prop.team_a_name && prop.team_b_name && (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-600">
                      {prop.team_a_name}
                    </span>
                    <span className="text-lg font-bold">
                      {prop.team_a_score !== null ? prop.team_a_score : '-'}
                    </span>
                  </div>
                )}
                {prop.team_b_name && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {prop.team_b_name}
                    </span>
                    <span className="text-lg font-bold">
                      {prop.team_b_score !== null ? prop.team_b_score : '-'}
                    </span>
                  </div>
                )}
                {prop.winning_team_id && (
                  <p className="text-xs text-green-600 mt-1">
                    Winner: {prop.winning_team_id}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auto-refresh indicator */}
      <p className="text-xs text-gray-500 text-center">
        Updates every 30 seconds
      </p>
    </div>
  );
};

export default LiveGameStats;
