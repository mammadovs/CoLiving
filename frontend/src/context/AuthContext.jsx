import { createContext, useContext, useState, useCallback } from 'react'
import { authAPI } from '../api/auth'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user')
        try { return storedUser ? JSON.parse(storedUser) : null } catch { return null }
    })
    const [token, setToken] = useState(() => localStorage.getItem('token'))

    const login = useCallback(async (email, password) => {
        const response = await authAPI.login(email, password)
        localStorage.setItem('token', response.access_token)
        setToken(response.access_token)
        const currentUser = await authAPI.getCurrentUser()
        localStorage.setItem('user', JSON.stringify(currentUser))
        setUser(currentUser)
        return currentUser
    }, [])

    const register = useCallback(async (data) => {
        const response = await authAPI.register(data)
        localStorage.setItem('token', response.access_token)
        setToken(response.access_token)
        const currentUser = response.user || await authAPI.getCurrentUser()
        localStorage.setItem('user', JSON.stringify(currentUser))
        setUser(currentUser)
        return currentUser
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
    }, [])

    const updateUser = useCallback((nextUser) => {
        setUser(nextUser)
        localStorage.setItem('user', JSON.stringify(nextUser))
    }, [])

    return <AuthContext.Provider value={{ user, token, loading: false, isAuthenticated: Boolean(token), login, register, logout, updateUser }}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within AuthProvider')
    return context
}
