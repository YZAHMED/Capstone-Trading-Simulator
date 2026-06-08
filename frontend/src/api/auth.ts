import { api } from './client'

export interface RegisterData {
  username: string
  email: string
  password: string
}

export async function registerUser(data: RegisterData) {
  const res = await api.post('/users/register', data)
  return res.data
}
