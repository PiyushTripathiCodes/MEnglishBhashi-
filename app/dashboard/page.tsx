"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BookOpen, Clock, Users, Search, LogOut, User } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { courseAPI } from "@/lib/api"

// Mock data
const mockCourses = [
  {
    id: "1",
    title: "Full Stack Web Development",
    description: "Learn to build modern web applications with React, Node.js, and MongoDB",
    instructor: "Sarah Johnson",
    duration: "12 weeks",
    students: 1250,
    progress: 65,
    level: "Intermediate",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "2",
    title: "Data Science with Python",
    description: "Master data analysis, visualization, and machine learning with Python",
    instructor: "Dr. Michael Chen",
    duration: "10 weeks",
    students: 890,
    progress: 30,
    level: "Beginner",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "3",
    title: "Mobile App Development",
    description: "Build cross-platform mobile apps with React Native",
    instructor: "Alex Rodriguez",
    duration: "8 weeks",
    students: 650,
    progress: 0,
    level: "Advanced",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "4",
    title: "UI/UX Design Fundamentals",
    description: "Learn design principles and create beautiful user interfaces",
    instructor: "Emma Wilson",
    duration: "6 weeks",
    students: 1100,
    progress: 85,
    level: "Beginner",
    image: "/placeholder.svg?height=200&width=300",
  },
]

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const { user, logout } = useAuth()
  const [courses, setCourses] = useState([])
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allCoursesRes, enrolledRes] = await Promise.all([
          courseAPI.getAllCourses(),
          courseAPI.getEnrolledCourses(),
        ])
        setCourses(allCoursesRes.data.courses)
        setEnrolledCourses(enrolledRes.data)
      } catch (error) {
        console.error("Failed to fetch courses:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const availableCourses = courses.filter((course) => !enrolledCourses.find((ec) => ec.courseId === course.id))

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">LearnHub</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">{user.name}</span>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name.split(" ")[0]}!</h1>
          <p className="text-gray-600">Continue your learning journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrolledCourses.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hours Learned</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certificates</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Continue Learning */}
        {enrolledCourses.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Continue Learning</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <Card key={course.courseId} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <img
                      src={course.course.image || "/placeholder.svg"}
                      alt={course.course.title}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                    <CardTitle className="text-lg">{course.course.title}</CardTitle>
                    <CardDescription>{course.course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="w-full" />
                      <Link href={`/courses/${course.courseId}`}>
                        <Button className="w-full">Continue Learning</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Available Courses */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Explore Courses</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <img
                    src={course.image || "/placeholder.svg"}
                    alt={course.title}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <Badge
                      variant={
                        course.level === "Beginner"
                          ? "secondary"
                          : course.level === "Intermediate"
                            ? "default"
                            : "destructive"
                      }
                    >
                      {course.level}
                    </Badge>
                  </div>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{course.students}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">By {course.instructor}</p>
                    <Link href={`/courses/${course.id}`}>
                      <Button
                        className="w-full"
                        variant={enrolledCourses.find((ec) => ec.courseId === course.id) ? "default" : "outline"}
                      >
                        {enrolledCourses.find((ec) => ec.courseId === course.id) ? "Continue" : "Enroll Now"}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
