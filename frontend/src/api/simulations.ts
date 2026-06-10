import { api } from './client'

export interface Simulation {
  id: number
  user_id: number
  name: string
  symbol: string
  num_transactions: number
  rate_per_second: number
  duration_seconds: number
  status: string
  created_at: string
  started_at: string | null
  finished_at: string | null
}

export interface SimulationInput {
  name: string
  symbol: string
  num_transactions: number
  rate_per_second: number
  duration_seconds: number
}

export async function listSimulations() {
  const res = await api.get<Simulation[]>('/simulations')
  return res.data
}

export async function getSimulation(id: number) {
  const res = await api.get<Simulation>(`/simulations/${id}`)
  return res.data
}

export async function createSimulation(data: SimulationInput) {
  const res = await api.post<Simulation>('/simulations', data)
  return res.data
}

export async function updateSimulation(id: number, data: SimulationInput) {
  const res = await api.put<Simulation>(`/simulations/${id}`, data)
  return res.data
}

export async function deleteSimulation(id: number) {
  await api.delete(`/simulations/${id}`)
}
