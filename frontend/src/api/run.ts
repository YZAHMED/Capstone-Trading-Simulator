import { api } from './client'

export interface SimulationProgress {
  id: number
  status: string
  completed: number
  total: number
}

export async function startSimulation(id: number) {
  const res = await api.post(`/simulations/${id}/run`)
  return res.data
}

export async function getProgress(id: number) {
  const res = await api.get<SimulationProgress>(`/simulations/${id}/progress`)
  return res.data
}
