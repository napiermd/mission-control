'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Skill {
  skill_name: string
  skill_version: string
  total_executions: number
  successes: number
  failures: number
  avg_latency: number
  last_run: number
  success_rate: number
  status: 'healthy' | 'warning' | 'critical'
}

interface SkillStats {
  total_executions: number
  successes: number
  failures: number
  avg_latency: number
  avg_tokens: number
  success_rate: number
  failure_types: Record<string, number>
}

interface Failure {
  id: number
  started_at: number
  error_type: string
  error_message: string
  model: string
}

interface Pattern {
  error_type: string
  error_message: string
  count: number
  first_seen: number
  last_seen: number
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [skillStats, setSkillStats] = useState<SkillStats | null>(null)
  const [failures, setFailures] = useState<Failure[]>([])
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSkills()
  }, [])

  useEffect(() => {
    if (selectedSkill) {
      loadSkillDetails(selectedSkill)
    }
  }, [selectedSkill])

  async function loadSkills() {
    try {
      const res = await fetch('/api/skills?action=list')
      const data = await res.json()
      setSkills(data)
      if (data.length > 0 && !selectedSkill) {
        setSelectedSkill(data[0].skill_name)
      }
    } catch (error) {
      console.error('Failed to load skills:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadSkillDetails(skillName: string) {
    try {
      const [statsRes, failuresRes, patternsRes] = await Promise.all([
        fetch(`/api/skills?action=stats&skill=${skillName}`),
        fetch(`/api/skills?action=failures&skill=${skillName}&limit=10`),
        fetch(`/api/skills?action=patterns&skill=${skillName}`)
      ])

      const [stats, failuresData, patternsData] = await Promise.all([
        statsRes.json(),
        failuresRes.json(),
        patternsRes.json()
      ])

      setSkillStats(stats)
      setFailures(failuresData)
      setPatterns(patternsData)
    } catch (error) {
      console.error('Failed to load skill details:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading skill evolution data...</div>
  }

  if (skills.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Skill Evolution</h1>
        <div className="card text-center py-12">
          <div className="text-gray-400 mb-4">No skill execution data yet</div>
          <div className="text-sm text-gray-500">
            Skills will appear here once they start executing and logging telemetry.
          </div>
        </div>
      </div>
    )
  }

  const healthyCount = skills.filter(s => s.status === 'healthy').length
  const warningCount = skills.filter(s => s.status === 'warning').length
  const criticalCount = skills.filter(s => s.status === 'critical').length

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Skill Evolution</h1>
        <div className="text-sm text-gray-400">
          Self-improving skills • Last 7 days
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="text-gray-400 text-sm">Total Skills</div>
          <div className="text-3xl font-bold">{skills.length}</div>
          <div className="text-xs text-gray-500 mt-2">monitored</div>
        </div>
        <div className="card">
          <div className="text-gray-400 text-sm">Healthy</div>
          <div className="text-3xl font-bold text-green-400">{healthyCount}</div>
          <div className="text-xs text-gray-500 mt-2">≥90% success</div>
        </div>
        <div className="card">
          <div className="text-gray-400 text-sm">Warning</div>
          <div className="text-3xl font-bold text-yellow-400">{warningCount}</div>
          <div className="text-xs text-gray-500 mt-2">70-89% success</div>
        </div>
        <div className="card">
          <div className="text-gray-400 text-sm">Critical</div>
          <div className="text-3xl font-bold text-red-400">{criticalCount}</div>
          <div className="text-xs text-gray-500 mt-2">&lt;70% success</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Skills List */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Skills</h2>
          <div className="space-y-2">
            {skills.map(skill => (
              <div
                key={skill.skill_name}
                onClick={() => setSelectedSkill(skill.skill_name)}
                className={`p-3 rounded cursor-pointer transition ${
                  selectedSkill === skill.skill_name
                    ? 'bg-blue-900/30 border border-blue-500'
                    : 'bg-gray-800/50 hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium">{skill.skill_name}</div>
                  <div className={`w-2 h-2 rounded-full ${
                    skill.status === 'healthy' ? 'bg-green-400' :
                    skill.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                  }`} />
                </div>
                <div className="text-xs text-gray-400">
                  {skill.success_rate.toFixed(0)}% success • {skill.total_executions} runs
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Details */}
        <div className="col-span-2 space-y-6">
          {selectedSkill && skillStats && (
            <>
              {/* Stats */}
              <div className="card">
                <h2 className="text-xl font-bold mb-4">{selectedSkill}</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-gray-400 text-sm">Success Rate</div>
                    <div className={`text-2xl font-bold ${
                      skillStats.success_rate >= 90 ? 'text-green-400' :
                      skillStats.success_rate >= 70 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {skillStats.success_rate.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Avg Latency</div>
                    <div className="text-2xl font-bold">
                      {skillStats.avg_latency ? `${skillStats.avg_latency.toFixed(0)}ms` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Failures</div>
                    <div className="text-2xl font-bold text-red-400">{skillStats.failures}</div>
                  </div>
                </div>
              </div>

              {/* Failure Patterns */}
              {patterns.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-bold mb-4">Failure Patterns</h3>
                  <div className="space-y-3">
                    {patterns.map((pattern, idx) => (
                      <div key={idx} className="p-3 bg-red-900/20 border border-red-500/30 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-red-400">{pattern.error_type}</div>
                          <div className="text-sm text-gray-400">{pattern.count} occurrences</div>
                        </div>
                        <div className="text-sm text-gray-300 mb-1">
                          {pattern.error_message.substring(0, 100)}
                          {pattern.error_message.length > 100 && '...'}
                        </div>
                        <div className="text-xs text-gray-500">
                          First: {new Date(pattern.first_seen).toLocaleDateString()} • 
                          Last: {new Date(pattern.last_seen).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Failure Types Breakdown */}
              {Object.keys(skillStats.failure_types).length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-bold mb-4">Failure Types</h3>
                  <div className="space-y-2">
                    {Object.entries(skillStats.failure_types).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="text-gray-300">{type}</div>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-700 rounded overflow-hidden">
                            <div 
                              className="h-full bg-red-400"
                              style={{ width: `${(count / skillStats.failures) * 100}%` }}
                            />
                          </div>
                          <div className="text-sm text-gray-400 w-8 text-right">{count}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Failures */}
              {failures.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-bold mb-4">Recent Failures</h3>
                  <div className="space-y-2">
                    {failures.map(failure => (
                      <div key={failure.id} className="p-3 bg-gray-800/50 rounded text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-gray-400">{failure.error_type}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(failure.started_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-gray-300 text-xs">
                          {failure.error_message.substring(0, 120)}
                          {failure.error_message.length > 120 && '...'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
