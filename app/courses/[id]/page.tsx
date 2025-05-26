"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { BookOpen, Clock, Users, Play, CheckCircle, Circle, ArrowLeft } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { courseAPI } from "@/lib/api"

export default function CoursePage() {
  return (
    <ProtectedRoute>
      <CourseContent />
    </ProtectedRoute>
  )
}

function CourseContent() {
  const { user } = useAuth()
  const [course, setCourse] = useState<any>(null)
  const [userProgress, setUserProgress] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await courseAPI.getCourseById(courseId)
        setCourse(response.data.course)
        setUserProgress(response.data.userProgress)
      } catch (error) {
        console.error("Failed to fetch course:", error)
        router.push("/dashboard")
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [courseId, router])

  const handleEnroll = async () => {
    setEnrolling(true)
    try {
      await courseAPI.enrollInCourse(courseId)
      // Refresh course data to get updated enrollment status
      const response = await courseAPI.getCourseById(courseId)
      setUserProgress(response.data.userProgress)
    } catch (error) {
      console.error("Failed to enroll:", error)
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!course) {
    return <div>Course not found</div>
  }

  const totalChapters = course.sections.reduce(
    (total: number, section: any) =>
      total + section.units.reduce((unitTotal: number, unit: any) => unitTotal + unit.chapters.length, 0),
    0,
  )

  const completedChapters = userProgress?.progress || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">LearnHub</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Course Header */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="mb-4">
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>
            <p className="text-lg text-gray-600 mb-6">{course.description}</p>

            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{course.duration} hours</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{course.enrollmentCount} students</span>
              </div>
              <span>
                By {course.instructor.firstName} {course.instructor.lastName}
              </span>
            </div>

            {userProgress?.isEnrolled && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Course Progress</span>
                  <span className="text-sm text-gray-600">{userProgress.progress}% completed</span>
                </div>
                <Progress value={userProgress.progress} className="w-full" />
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <img
                  src={course.thumbnail || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </CardHeader>
              <CardContent>
                {!userProgress?.isEnrolled ? (
                  <Button onClick={handleEnroll} className="w-full mb-4" disabled={enrolling}>
                    {enrolling ? "Enrolling..." : "Enroll Now"}
                  </Button>
                ) : (
                  <Link href={`/courses/${courseId}/learn`}>
                    <Button className="w-full mb-4">
                      <Play className="h-4 w-4 mr-2" />
                      Continue Learning
                    </Button>
                  </Link>
                )}

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{course.duration} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Level:</span>
                    <span>{course.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Students:</span>
                    <span>{course.enrollmentCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Chapters:</span>
                    <span>{totalChapters}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Course Content */}
        <Card>
          <CardHeader>
            <CardTitle>Course Content</CardTitle>
            <CardDescription>
              {course.sections.length} sections • {totalChapters} chapters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {course.sections.map((section: any) => (
                <AccordionItem key={section._id} value={section._id}>
                  <AccordionTrigger className="text-left">
                    <div>
                      <h3 className="font-semibold">{section.title}</h3>
                      <p className="text-sm text-gray-600">{section.description}</p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      {section.units.map((unit: any) => (
                        <div key={unit._id} className="border-l-2 border-gray-200 pl-4">
                          <h4 className="font-medium mb-2">{unit.title}</h4>
                          <div className="space-y-2">
                            {unit.chapters.map((chapter: any) => (
                              <div
                                key={chapter._id}
                                className="flex items-center justify-between p-2 rounded hover:bg-gray-50"
                              >
                                <div className="flex items-center space-x-3">
                                  {chapter.completed ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Circle className="h-4 w-4 text-gray-400" />
                                  )}
                                  <span className={chapter.completed ? "text-green-700" : "text-gray-700"}>
                                    {chapter.title}
                                  </span>
                                </div>
                                <span className="text-sm text-gray-500">{chapter.type}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
