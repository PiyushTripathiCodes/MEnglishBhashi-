"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { authAPI, setAuthToken, removeAuthToken, getAuthToken } from "./api"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  name: string
  enrolledCourses: string[]
  createdAt: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: {
    firstName: string
    lastName: string
    email: string
    password: string
  }) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAuthToken()
      if (token) {
        try {
          const userData = await authAPI.getProfile()
          setUser(userData.user)
        } catch (error) {
          console.error("Failed to get user profile:", error)
          removeAuthToken()
        }
      }
      setLoading(false)
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password })
      setAuthToken(response.token)
      setUser(response.user)
    } catch (error) {
      throw error
    }
  }

  const register = async (userData: {
    firstName: string
    lastName: string
    email: string
    password: string
  }) => {
    try {
      const response = await authAPI.register(userData)
      setAuthToken(response.token)
      setUser(response.user)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    removeAuthToken()
    setUser(null)
  }

  const updateUser = async (userData: Partial<User>) => {
    try {
      const response = await authAPI.updateProfile(userData)
      setUser(response.user)
    } catch (error) {
      throw error
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
