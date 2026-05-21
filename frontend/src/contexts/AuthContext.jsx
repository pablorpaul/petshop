import { createContext, useState, useEffect } from 'react';
import api from '../services/api'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        const savedUser = localStorage.getItem('user')

        if (token && savedUser){
            setUser(JSON.parse(savedUser))
        }

        setLoading(false)
    }, [])

    async function login(email, password){
        const response = await api.post('/auth/login', { email, password})
        const { data } = response.data
        const { token, user } = data

        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))

        setUser(user)
    }

    async function logout(){
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{user, login, logout, loading, authenticated:!!user}}>
            {children}
        </AuthContext.Provider>
    )
}