import { api } from './client'
import { Simulation } from './simulations'

export interface SimulationProgress {
  id: number
  status: string
  completed: number
  total: number
}

export interface SimulationPoint {
  transaction_number: number
  latency_ms: number
  success: boolean
}

export interface SimulationResults {
  simulation: Simulation
  total: number
  success_rate: number
  avg_latency_ms: number
  p95_latency_ms: number
  points: SimulationPoint[]
}

export async function startSimulation(id: number) {
  const res = await api.post(`/simulations/${id}/run`)
  return res.data
}

export async function getProgress(id: number) {
  const res = await api.get<SimulationProgress>(`/simulations/${id}/progress`)
  return res.data
}

export async function getResults(id: number) {
  const res = await api.get<SimulationResults>(`/simulations/${id}/results`)
  return res.data
}
