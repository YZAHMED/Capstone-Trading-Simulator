import { api } from './client'

export interface RegisterData {
  username: string
  email: string
  password: string
}

export interface User {
  id: number
  username: string
  email: string
  role: string
  is_active: boolean
}

export async function registerUser(data: RegisterData) {
  const res = await api.post('/users/register', data)
  return res.data
}

export async function loginUser(username: string, password: string) {
  const form = new URLSearchParams()
  form.append('username', username)
  form.append('password', password)
  const res = await api.post('/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return res.data as { access_token: string; token_type: string; user: User }
}

export async function getMe() {
  const res = await api.get('/auth/me')
  return res.data as User
}
