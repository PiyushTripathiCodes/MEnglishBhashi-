"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, ArrowLeft, ArrowRight, CheckCircle, Play, FileText, Clock } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { chapterAPI, courseAPI } from "@/lib/api"

export default function LearnPage() {
  return (
    <ProtectedRoute>
      <LearnContent />
    </ProtectedRoute>
  )
}

function LearnContent() {
  const { user } = useAuth()
  const [chapter, setChapter] = useState<any>(null)
  const [course, setCourse] = useState<any>(null)
  const [progress, setProgress] = useState<any>(null)
  const [navigation, setNavigation] = useState<any>(null)
  const [quizAnswer, setQuizAnswer] = useState("")
  const [showQuizResult, setShowQuizResult] = useState(false)
  const [quizResult, setQuizResult] = useState<any>(null)
  const [activityCode, setActivityCode] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  const courseId = params.id as string
  const chapterId = searchParams.get("chapter") || ""

  useEffect(() => {
    const fetchChapterData = async () => {
      if (!chapterId) {
        // If no chapter specified, get the first chapter or current progress
        try {
          const courseResponse = await courseAPI.getCourseById(courseId)
          const courseData = courseResponse.data.course
          setCourse(courseData)

          // Get first chapter ID
          const firstChapter = courseData.sections[0]?.units[0]?.chapters[0]
          if (firstChapter) {
            router.replace(`/courses/${courseId}/learn?chapter=${firstChapter._id}`)
          }
        } catch (error) {
          console.error("Failed to fetch course:", error)
          router.push(`/courses/${courseId}`)
        }
        return
      }

      try {
        setLoading(true)
        const [chapterResponse, courseResponse] = await Promise.all([
          chapterAPI.getChapterContent(courseId, chapterId),
          courseAPI.getCourseById(courseId),
        ])

        setChapter(chapterResponse.data.chapter)
        setProgress(chapterResponse.data.progress)
        setNavigation(chapterResponse.data.navigation)
        setCourse(courseResponse.data.course)

        // Set initial activity code if available
        if (chapterResponse.data.chapter.activity?.starterCode) {
          setActivityCode(chapterResponse.data.chapter.activity.starterCode)
        }
      } catch (error) {
        console.error("Failed to fetch chapter:", error)
        router.push(`/courses/${courseId}`)
      } finally {
        setLoading(false)
      }
    }

    fetchChapterData()
  }, [courseId, chapterId, router])

  const handleQuizSubmit = async () => {
    if (!quizAnswer) return

    setSubmitting(true)
    try {
      const response = await chapterAPI.submitQuizAnswer(courseId, chapterId, quizAnswer)
      setQuizResult(response.data)
      setShowQuizResult(true)
    } catch (error) {
      console.error("Failed to submit quiz:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkComplete = async () => {
    try {
      await chapterAPI.markChapterComplete(courseId, chapterId)
      // Refresh chapter data to show updated progress
      const chapterResponse = await chapterAPI.getChapterContent(courseId, chapterId)
      setProgress(chapterResponse.data.progress)
    } catch (error) {
      console.error("Failed to mark chapter complete:", error)
    }
  }

  const handleNavigation = (direction: "next" | "previous") => {
    const targetChapter = direction === "next" ? navigation?.nextChapter : navigation?.previousChapter
    if (targetChapter) {
      router.push(`/courses/${courseId}/learn?chapter=${targetChapter.id}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!chapter || !course) {
    return <div>Chapter not found</div>
  }

  // Calculate overall progress
  const totalChapters = course.sections.reduce(
    (total: number, section: any) =>
      total + section.units.reduce((unitTotal: number, unit: any) => unitTotal + unit.chapters.length, 0),
    0,
  )

  const currentChapterIndex = course.sections
    .flatMap((section: any) => section.units.flatMap((unit: any) => unit.chapters))
    .findIndex((ch: any) => ch._id === chapterId)

  const overallProgress = totalChapters > 0 ? ((currentChapterIndex + 1) / totalChapters) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/courses/${courseId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Course
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">LearnHub</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Progress value={overallProgress} className="w-32" />
            <span className="text-sm text-gray-600">
              {currentChapterIndex + 1}/{totalChapters} chapters
            </span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Chapter Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{chapter.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              {chapter.type === "video" && (
                <div className="flex items-center space-x-1">
                  <Play className="h-4 w-4" />
                  <span>Video Lesson</span>
                </div>
              )}
              {chapter.type === "reading" && (
                <div className="flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>Reading</span>
                </div>
              )}
              {chapter.content?.estimatedReadTime && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{chapter.content.estimatedReadTime} min read</span>
                </div>
              )}
              {progress?.isCompleted && (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Completed</span>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Main Content */}
            <Card>
              <CardContent className="p-6">
                {chapter.type === "video" && (
                  <div>
                    <div className="aspect-video bg-gray-900 rounded-lg mb-4 flex items-center justify-center">
                      <Play className="h-16 w-16 text-white" />
                    </div>
                    {chapter.content?.description && <p className="text-gray-700">{chapter.content.description}</p>}
                  </div>
                )}

                {chapter.type === "reading" && chapter.content?.text && (
                  <div className="prose max-w-none">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: chapter.content.text
                          .replace(/\n/g, "<br>")
                          .replace(/`([^`]+)`/g, "<code>$1</code>")
                          .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
                          .replace(/\*([^*]+)\*/g, "<em>$1</em>"),
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quiz */}
            {chapter.quiz && (
              <Card>
                <CardHeader>
                  <CardTitle>Quick Quiz</CardTitle>
                  <CardDescription>Test your understanding of this chapter</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <h3 className="font-medium">{chapter.quiz.question}</h3>
                    <RadioGroup value={quizAnswer} onValueChange={setQuizAnswer}>
                      {chapter.quiz.options.map((option: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                          <Label htmlFor={`option-${index}`}>{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>

                    {!showQuizResult ? (
                      <Button onClick={handleQuizSubmit} disabled={!quizAnswer || submitting}>
                        {submitting ? "Submitting..." : "Submit Answer"}
                      </Button>
                    ) : (
                      <Alert
                        className={quizResult?.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
                      >
                        <CheckCircle
                          className={`h-4 w-4 ${quizResult?.isCorrect ? "text-green-600" : "text-red-600"}`}
                        />
                        <AlertDescription>
                          <span className={`font-medium ${quizResult?.isCorrect ? "text-green-800" : "text-red-800"}`}>
                            {quizResult?.isCorrect ? "Correct!" : "Incorrect"}
                          </span>
                          {quizResult?.explanation && <p className="mt-2">{quizResult.explanation}</p>}
                          {!quizResult?.isCorrect && (
                            <p className="mt-2">
                              The correct answer is: {chapter.quiz.options[quizResult?.correctAnswer]}
                            </p>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity */}
            {chapter.activity && (
              <Card>
                <CardHeader>
                  <CardTitle>Hands-on Activity</CardTitle>
                  <CardDescription>Practice what you've learned</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-700">{chapter.activity.prompt}</p>
                    <div>
                      <Label htmlFor="code-editor">Your Code:</Label>
                      <Textarea
                        id="code-editor"
                        value={activityCode}
                        onChange={(e) => setActivityCode(e.target.value)}
                        className="font-mono text-sm mt-2"
                        rows={8}
                        placeholder="Write your code here..."
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline">Run Code</Button>
                      <Button variant="outline">Submit</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mark as Complete */}
            {!progress?.isCompleted && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Mark Chapter as Complete</h3>
                      <p className="text-sm text-gray-600">Mark this chapter as completed to track your progress</p>
                    </div>
                    <Button onClick={handleMarkComplete}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t">
            <Button
              variant="outline"
              onClick={() => handleNavigation("previous")}
              disabled={!navigation?.previousChapter}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous: {navigation?.previousChapter?.title || "None"}
            </Button>

            <Button onClick={() => handleNavigation("next")} disabled={!navigation?.nextChapter}>
              Next: {navigation?.nextChapter?.title || "Course Complete"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
