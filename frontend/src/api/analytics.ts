import { api } from './client'

export interface DailyMetric {
  day: string
  value: number
}

export interface AnalyticsSummary {
  range: string
  total_simulations: number
  total_completed: number
  avg_latency_all_time: number
  daily_avg_latency: DailyMetric[]
  daily_runs: DailyMetric[]
}

export interface HistoryItem {
  id: number
  user_id: number
  username: string
  name: string
  symbol: string
  status: string
  created_at: string
  started_at: string | null
  finished_at: string | null
}

export async function getAnalyticsSummary(range: string) {
  const res = await api.get<AnalyticsSummary>('/analytics/summary', {
    params: { range },
  })
  return res.data
}

export async function getHistory() {
  const res = await api.get<HistoryItem[]>('/analytics/history')
  return res.data
}
