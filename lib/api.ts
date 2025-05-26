// API utility functions for frontend-backend communication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Token management
export const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken")
  }
  return null
}

export const setAuthToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("authToken", token)
  }
}

export const removeAuthToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
  }
}

// API request wrapper with authentication
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken()

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

    if (!response.ok) {
      if (response.status === 401) {
        removeAuthToken()
        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
      }

      const errorData = await response.json().catch(() => ({ message: "Network error" }))
      throw new Error(errorData.message || `API Error: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error - please check your connection")
    }
    throw error
  }
}

// Authentication API calls
export const authAPI = {
  register: async (userData: {
    firstName: string
    lastName: string
    email: string
    password: string
  }) => {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },

  login: async (credentials: { email: string; password: string }) => {
    return apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  },

  getProfile: async () => {
    return apiRequest("/auth/profile")
  },

  updateProfile: async (userData: any) => {
    return apiRequest("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  },

  changePassword: async (passwordData: { currentPassword: string; newPassword: string }) => {
    return apiRequest("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(passwordData),
    })
  },
}

// Course API calls
export const courseAPI = {
  getAllCourses: async (filters?: { search?: string; level?: string; category?: string }) => {
    const queryParams = new URLSearchParams()
    if (filters?.search) queryParams.append("search", filters.search)
    if (filters?.level) queryParams.append("level", filters.level)
    if (filters?.category) queryParams.append("category", filters.category)

    const queryString = queryParams.toString()
    return apiRequest(`/courses${queryString ? `?${queryString}` : ""}`)
  },

  getCourseById: async (courseId: string) => {
    return apiRequest(`/courses/${courseId}`)
  },

  enrollInCourse: async (courseId: string) => {
    return apiRequest(`/courses/${courseId}/enroll`, {
      method: "POST",
    })
  },

  getEnrolledCourses: async () => {
    return apiRequest("/courses/enrolled")
  },

  getCourseProgress: async (courseId: string) => {
    return apiRequest(`/courses/${courseId}/progress`)
  },
}

// Chapter API calls
export const chapterAPI = {
  getChapterContent: async (courseId: string, chapterId: string) => {
    return apiRequest(`/courses/${courseId}/chapters/${chapterId}`)
  },

  markChapterComplete: async (courseId: string, chapterId: string, timeSpent?: number) => {
    return apiRequest(`/courses/${courseId}/chapters/${chapterId}/complete`, {
      method: "POST",
      body: JSON.stringify({ timeSpent: timeSpent || 0 }),
    })
  },

  submitQuizAnswer: async (courseId: string, chapterId: string, answer: any) => {
    return apiRequest(`/courses/${courseId}/chapters/${chapterId}/quiz`, {
      method: "POST",
      body: JSON.stringify({ answer }),
    })
  },

  submitActivity: async (courseId: string, chapterId: string, submission: any) => {
    return apiRequest(`/courses/${courseId}/chapters/${chapterId}/activity`, {
      method: "POST",
      body: JSON.stringify({ submission }),
    })
  },
}

// Progress API calls
export const progressAPI = {
  getUserProgress: async () => {
    return apiRequest("/progress")
  },

  updateProgress: async (courseId: string, chapterId: string, progressData: any) => {
    return apiRequest("/progress", {
      method: "POST",
      body: JSON.stringify({
        courseId,
        chapterId,
        ...progressData,
      }),
    })
  },

  getCourseAnalytics: async (courseId: string) => {
    return apiRequest(`/progress/analytics/${courseId}`)
  },
}

// Health check
export const healthCheck = async () => {
  return apiRequest("/health")
}
