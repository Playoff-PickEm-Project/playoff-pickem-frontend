import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getUsername } from '../../../App'

import { GameStatusBar } from './GameStatusBar'
import { WinnerLoserProp } from './WinnerLoserProp'
import { OverUnderProp } from './OverUnderProp'
import { VariableOptionProp } from './VariableOptionProp'
import { CommissionerTools } from './CommissionerTools'
import ResultsTable from './ResultsTable'

const normalizePropType = (t) => {
  if (!t) return null
  const s = String(t).toLowerCase().trim()
  if (s.includes('winner') || s.includes('loser')) return 'winner_loser'
  if (s.includes('over') || s.includes('under')) return 'over_under'
  if (s.includes('variable') || s.includes('option')) return 'variable_option'
  return null
}

const GamePage = () => {
  const { leagueName, gameId } = useParams()
  const navigate = useNavigate()
  const username = getUsername()
  const apiUrl = process.env.REACT_APP_API_URL

  // Props pulled from backend
  const [overUnderProps, setOverUnderProps] = useState([])
  const [winnerLoserProps, setWinnerLoserProps] = useState([])
  const [variableOptionProps, setVariableOptionProps] = useState([])

  // Answers (from backend)
  const [winnerLoserAnswers, setWinnerLoserAnswers] = useState({})
  const [overUnderAnswers, setOverUnderAnswers] = useState({})
  const [variableOptionAnswers, setVariableOptionAnswers] = useState({})

  // Derived UI picks map
  const [userChoices, setUserChoices] = useState({})

  // League / commissioner
  const [isCommissioner, setIsCommissioner] = useState(false)

  // Game timing/status
  const [gameStartTime, setGameStartTime] = useState(null)

  // Post-lock results
  const [allPlayersAnswers, setAllPlayersAnswers] = useState([])

  // Live stats
  const [liveStats, setLiveStats] = useState(null)

  // Game name
  const [gameName, setGameName] = useState('Game Picks')

  // ✅ Grading flag (league/commissioner grading)
  const [isGraded, setIsGraded] = useState(false)

  // -----------------------------
  // Derived values
  // -----------------------------
  const isLocked = useMemo(() => {
    if (!gameStartTime) return false
    // Lock picks 5 minutes after start time
    const lockTime = new Date(gameStartTime.getTime() + 5 * 60 * 1000)
    return new Date() > lockTime
  }, [gameStartTime])

  // ✅ FIX: Completed means "graded", NOT ESPN final
  const gameStatus = useMemo(() => {
    if (isGraded) return 'completed'
    if (isLocked) return 'live'
    return 'upcoming'
  }, [isGraded, isLocked])

  const gameTimeLabel = useMemo(() => {
    if (!gameStartTime) return ''
    const d = gameStartTime
    const weekday = d.toLocaleDateString(undefined, { weekday: 'short' })
    const monthDay = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    return `${weekday}, ${monthDay} • ${time}`
  }, [gameStartTime])

  const lockTimeLabel = useMemo(() => {
    if (!gameStartTime) return null
    const diffMs = gameStartTime.getTime() - Date.now()
    if (diffMs <= 0) return null
    const totalMins = Math.floor(diffMs / 60000)
    const hours = Math.floor(totalMins / 60)
    const mins = totalMins % 60
    return `${hours}h ${mins}m`
  }, [gameStartTime])

  // -----------------------------
  // Fetch commissioner check
  // -----------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const leagueRes = await fetch(
          `${apiUrl}/get_league_by_name?leagueName=${encodeURIComponent(leagueName)}`,
          { method: 'GET', headers: { 'Content-Type': 'application/json' } }
        )
        if (!leagueRes.ok) throw new Error(`league http ${leagueRes.status}`)
        const leagueData = await leagueRes.json()

        const userRes = await fetch(
          `${apiUrl}/get_user_by_username?username=${encodeURIComponent(username)}`,
          { method: 'GET', headers: { 'Content-Type': 'application/json' } }
        )
        if (!userRes.ok) throw new Error(`user http ${userRes.status}`)
        const userData = await userRes.json()

        setIsCommissioner(leagueData?.commissioner?.user_id === userData?.id)
      } catch (e) {
        console.error(e)
        alert('Something went wrong')
      }
    }

    if (apiUrl && leagueName && username) fetchData()
  }, [apiUrl, leagueName, username])

  // -----------------------------
  // Fetch game by id (props + time + graded)
  // -----------------------------
  useEffect(() => {
    const loadGame = async () => {
      try {
        const res = await fetch(`${apiUrl}/get_game_by_id?game_id=${gameId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        if (!res.ok) throw new Error(`game http ${res.status}`)
        const data = await res.json()

        setOverUnderProps(data.over_under_props || [])
        setWinnerLoserProps(data.winner_loser_props || [])
        setVariableOptionProps(data.variable_option_props || [])
        setGameStartTime(data.start_time ? new Date(data.start_time) : null)
        setGameName(data.game_name || 'Game Picks')

        // ✅ IMPORTANT: completed == graded
        setIsGraded(Boolean(data.graded))
      } catch (e) {
        console.error(e)
        alert('Something went wrong')
      }
    }

    if (apiUrl && gameId) loadGame()
  }, [apiUrl, gameId])

  // -----------------------------
  // Fetch existing answers
  // -----------------------------
  useEffect(() => {
    const loadWL = async () => {
      try {
        const res = await fetch(
          `${apiUrl}/retrieve_winner_loser_answers?leagueName=${encodeURIComponent(
            leagueName
          )}&username=${encodeURIComponent(username)}`,
          { method: 'GET', headers: { 'Content-Type': 'application/json' } }
        )
        const data = await res.json()
        setWinnerLoserAnswers(data || {})
      } catch (e) {
        console.error(e)
      }
    }
    if (apiUrl && leagueName && username) loadWL()
  }, [apiUrl, leagueName, username])

  useEffect(() => {
    const loadOU = async () => {
      try {
        const res = await fetch(
          `${apiUrl}/retrieve_over_under_answers?leagueName=${encodeURIComponent(
            leagueName
          )}&username=${encodeURIComponent(username)}`,
          { method: 'GET', headers: { 'Content-Type': 'application/json' } }
        )
        const data = await res.json()
        setOverUnderAnswers(data || {})
      } catch (e) {
        console.error(e)
      }
    }
    if (apiUrl && leagueName && username) loadOU()
  }, [apiUrl, leagueName, username])

  useEffect(() => {
    const loadVO = async () => {
      try {
        const res = await fetch(
          `${apiUrl}/retrieve_variable_option_answers?leagueName=${encodeURIComponent(
            leagueName
          )}&username=${encodeURIComponent(username)}`,
          { method: 'GET', headers: { 'Content-Type': 'application/json' } }
        )
        const data = await res.json()
        setVariableOptionAnswers(data || {})
      } catch (e) {
        console.error(e)
      }
    }
    if (apiUrl && leagueName && username) loadVO()
  }, [apiUrl, leagueName, username])

  // Merge answers into userChoices (used by UI)
  useEffect(() => {
    const updated = {}

    for (const [propId, team] of Object.entries(winnerLoserAnswers || {})) {
      updated[propId] = { team }
    }
    for (const [propId, choice] of Object.entries(overUnderAnswers || {})) {
      updated[propId] = { ...updated[propId], choice }
    }
    for (const [propId, option] of Object.entries(variableOptionAnswers || {})) {
      updated[propId] = { ...updated[propId], option }
    }

    setUserChoices(updated)
  }, [winnerLoserAnswers, overUnderAnswers, variableOptionAnswers])

  // -----------------------------
  // Live stats polling (still used for scores/progress)
  // -----------------------------
  useEffect(() => {
    const fetchLive = async () => {
      try {
        const res = await fetch(`${apiUrl}/game/${gameId}/live_stats`, {
          method: 'GET',
          credentials: 'include',
        })
        if (res.ok) {
          const data = await res.json()
          setLiveStats(data)
        }
      } catch (e) {
        console.error('Error fetching live stats:', e)
      }
    }

    if (!apiUrl || !gameId) return
    fetchLive()
    const interval = setInterval(fetchLive, 30000)
    return () => clearInterval(interval)
  }, [apiUrl, gameId])

  const getOverUnderLiveStats = (propId) => {
    if (!liveStats?.over_under_props) return null
    return liveStats.over_under_props.find((p) => String(p.prop_id) === String(propId)) || null
  }

  const getWinnerLoserLiveStats = (propId) => {
    if (!liveStats?.winner_loser_props) return null
    return liveStats.winner_loser_props.find((p) => String(p.prop_id) === String(propId)) || null
  }

  // -----------------------------
  // Post-lock: fetch all players answers for tables
  // -----------------------------
  useEffect(() => {
    const getAnswers = async () => {
      try {
        const res = await fetch(`${apiUrl}/view_all_answers_for_game?game_id=${gameId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        if (!res.ok) return
        const data = await res.json()
        setAllPlayersAnswers(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error(e)
      }
    }

    if (apiUrl && isLocked && gameId) getAnswers()
  }, [apiUrl, gameId, isLocked])

  // -----------------------------
  // Submit handlers
  // -----------------------------
  const handleWinnerLoserProp = (prop_id, answer) => {
    if (isLocked) return
    const payload = { leagueName, username, prop_id, answer }

    fetch(`${apiUrl}/answer_winner_loser_prop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error('save failed')
        setUserChoices((prev) => ({
          ...prev,
          [prop_id]: { ...prev[prop_id], team: answer },
        }))
        setWinnerLoserAnswers((prev) => ({ ...prev, [prop_id]: answer }))
      })
      .catch(() => alert('Answer was not saved'))
  }

  const handleOverUnderProp = (prop_id, answer) => {
    if (isLocked) return
    const payload = { leagueName, username, prop_id, answer }

    fetch(`${apiUrl}/answer_over_under_prop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error('save failed')
        setUserChoices((prev) => ({
          ...prev,
          [prop_id]: { ...prev[prop_id], choice: answer },
        }))
        setOverUnderAnswers((prev) => ({ ...prev, [prop_id]: answer }))
      })
      .catch(() => alert('Answer was not saved'))
  }

  const handleVariableOptionProp = (prop_id, answer) => {
    if (isLocked) return
    const payload = { leagueName, username, prop_id, answer }

    fetch(`${apiUrl}/answer_variable_option_prop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error('save failed')
        setUserChoices((prev) => ({
          ...prev,
          [prop_id]: { ...prev[prop_id], option: answer },
        }))
        setVariableOptionAnswers((prev) => ({ ...prev, [prop_id]: answer }))
      })
      .catch(() => alert('Answer was not saved'))
  }

  // Commissioner actions
  const handleEditGame = () => navigate(`/league-home/${leagueName}/editGame/${gameId}`)
  const handleGradeGame = () => navigate(`/league-home/${leagueName}/setCorrectAnswers/${gameId}`)

  // -----------------------------
  // Results blocks: SAME ORDER as form, STRICT matching (prevents row bleed)
  // -----------------------------
  const orderedResultsBlocks = useMemo(() => {
    if (!isLocked || !Array.isArray(allPlayersAnswers) || allPlayersAnswers.length === 0) return []

    const orderedProps = [
      ...(winnerLoserProps || []).map((p) => ({ kind: 'winner_loser', prop: p })),
      ...(overUnderProps || []).map((p) => ({ kind: 'over_under', prop: p })),
      ...(variableOptionProps || []).map((p) => ({ kind: 'variable_option', prop: p })),
    ]

    return orderedProps
      .map(({ kind, prop }) => {
        const wantId = String(prop.prop_id)
        const wantType = kind
        const wantQuestion = String(prop.question || '')

        const rowsRaw = allPlayersAnswers.filter((r) => {
          const rId = String(r.prop_id)
          const rQ = r.question != null ? String(r.question) : ''
          const rType = normalizePropType(r.prop_type)

          if (rType) return rType === wantType && rId === wantId
          if (rQ) return rQ === wantQuestion
          return rId === wantId
        })

        if (rowsRaw.length === 0) return null

        const seen = new Set()
        const rows = []
        for (const row of rowsRaw) {
          const key = `${row.player_name}|${row.answer}|${row.prop_id}|${row.prop_type || ''}|${row.question || ''}`
          if (seen.has(key)) continue
          seen.add(key)
          rows.push(row)
        }

        const correctAnswer = rows[0]?.correct_answer
        const correctLabel =
          correctAnswer === null || correctAnswer === undefined
            ? undefined
            : Array.isArray(correctAnswer)
            ? correctAnswer.join(', ')
            : String(correctAnswer)

        const tableResults = rows.map((row) => {
          const ca = row.correct_answer
          const isCorrect =
            ca === null || ca === undefined
              ? undefined
              : Array.isArray(ca)
              ? ca.includes(row.answer)
              : ca === row.answer

          return {
            playerName: row.player_name,
            answer: row.answer,
            isCorrect,
          }
        })

        return {
          key: `${kind}:${prop.prop_id}`,
          question: prop.question,
          correctLabel,
          tableResults,
        }
      })
      .filter(Boolean)
  }, [isLocked, allPlayersAnswers, winnerLoserProps, overUnderProps, variableOptionProps])

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="min-h-screen bg-zinc-950 relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl sm:text-5xl text-white mb-2">{gameName}</h1>
              <p className="text-gray-400 text-lg">
                Make your picks before lock time and track results live.
              </p>
            </div>
            <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm whitespace-nowrap self-start">
              League: {leagueName}
            </div>
          </div>
          <div className="h-px bg-white/10 mt-8"></div>
        </div>

        <div className="mb-8">
          <GameStatusBar
            matchup={gameName || 'Game'}
            gameTime={gameTimeLabel}
            status={gameStatus}
            lockTime={lockTimeLabel || undefined}
            isLocked={isLocked}
          />
        </div>

        {isLocked && (
          <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-center">
            <p className="text-red-400">🔒 Answers are locked. You can no longer change your picks.</p>
          </div>
        )}

        <div className="space-y-6 mb-8">
          {winnerLoserProps.map((prop) => {
            const ls = getWinnerLoserLiveStats(prop.prop_id)
            const teamAName = ls?.team_a_name || prop.favorite_team
            const teamBName = ls?.team_b_name || prop.underdog_team

            return (
              <WinnerLoserProp
                key={prop.prop_id}
                question={prop.question}
                teamA={{
                  name: teamAName,
                  points: prop.favorite_points,
                  score: ls?.team_a_score ?? undefined,
                  isFavorite: true,
                }}
                teamB={{
                  name: teamBName,
                  points: prop.underdog_points,
                  score: ls?.team_b_score ?? undefined,
                  isFavorite: false,
                }}
                selectedTeam={userChoices[prop.prop_id]?.team}
                onSelect={(team) => handleWinnerLoserProp(prop.prop_id, team)}
                isLocked={isLocked}
                gameStatus={gameStatus}
              />
            )
          })}

          {overUnderProps.map((prop) => {
            const ls = getOverUnderLiveStats(prop.prop_id)

            return (
              <OverUnderProp
                key={prop.prop_id}
                playerName={prop.player_name || ls?.player_name || 'Player'}
                statType={(prop.stat_type || ls?.stat_type || '').toString().replace(/_/g, ' ')}
                line={Number(prop.line_value ?? ls?.line_value ?? 0)}
                currentValue={
                  ls?.current_value === null || ls?.current_value === undefined
                    ? undefined
                    : Number(ls.current_value)
                }
                overPoints={prop.over_points}
                underPoints={prop.under_points}
                selectedOption={userChoices[prop.prop_id]?.choice}
                onSelect={(opt) => handleOverUnderProp(prop.prop_id, opt)}
                isLocked={isLocked}
                gameStatus={gameStatus}
              />
            )
          })}

          {variableOptionProps.map((prop) => {
            const options = (prop.options || []).map((o) => ({
              id: o.answer_choice,
              text: o.answer_choice,
              points: o.answer_points,
            }))

            return (
              <VariableOptionProp
                key={prop.prop_id}
                question={prop.question}
                options={options}
                selectedOption={userChoices[prop.prop_id]?.option}
                onSelect={(optId) => handleVariableOptionProp(prop.prop_id, optId)}
                isLocked={isLocked}
              />
            )
          })}
        </div>

        {isCommissioner && (
          <div className="mb-8">
            <CommissionerTools
            isCommissioner={isCommissioner}
            isGraded={isGraded}
            onEditGame={handleEditGame}
            onGradeGame={handleGradeGame}
            />
          </div>
        )}

        {isLocked && orderedResultsBlocks.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-3xl text-white">Results</h2>

            {orderedResultsBlocks.map((block) => (
              <ResultsTable
                key={block.key}
                question={block.question}
                correctAnswer={block.correctLabel}
                results={block.tableResults}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default GamePage
