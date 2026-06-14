import { api } from './client'
import { User } from './auth'

export interface ActivityLogEntry {
  id: number
  actor_username: string
  action: string
  target: string | null
  timestamp: string
}

export async function listAllUsers() {
  const res = await api.get<User[]>('/admin/users')
  return res.data
}

export async function changeUserRole(userId: number, role: string) {
  const res = await api.put<User>(`/admin/users/${userId}/role`, { role })
  return res.data
}

export async function deactivateUser(userId: number) {
  const res = await api.put<User>(`/admin/users/${userId}/deactivate`)
  return res.data
}

export async function reactivateUser(userId: number) {
  const res = await api.put<User>(`/admin/users/${userId}/reactivate`)
  return res.data
}

export async function getActivityLog() {
  const res = await api.get<ActivityLogEntry[]>('/admin/activity-log')
  return res.data
}
