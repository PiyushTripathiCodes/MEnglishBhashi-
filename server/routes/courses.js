const express = require("express")
const Course = require("../models/Course")
const Progress = require("../models/Progress")
const auth = require("../middleware/auth")
const { body, validationResult } = require("express-validator")

const router = express.Router()

// @route   GET /api/courses
// @desc    Get all published courses with filtering and search
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { search, category, level, page = 1, limit = 12, sortBy = "createdAt", sortOrder = "desc" } = req.query

    // Build query
    const query = { isPublished: true }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]
    }

    // Filter by category
    if (category && category !== "all") {
      query.category = category
    }

    // Filter by level
    if (level && level !== "all") {
      query.level = level
    }

    // Pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    // Sort options
    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1

    // Execute query
    const courses = await Course.find(query)
      .populate("instructor", "firstName lastName profile.avatar")
      .select("-sections") // Exclude detailed sections for list view
      .sort(sortOptions)
      .skip(skip)
      .limit(Number.parseInt(limit))

    // Get total count for pagination
    const totalCourses = await Course.countDocuments(query)
    const totalPages = Math.ceil(totalCourses / Number.parseInt(limit))

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages,
          totalCourses,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    })
  } catch (error) {
    console.error("Courses fetch error:", error)
    res.status(500).json({
      success: false,
      message: "Server error fetching courses",
    })
  }
})

// @route   GET /api/courses/enrolled
// @desc    Get user's enrolled courses
// @access  Private
router.get("/enrolled", auth, async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.user.id })
      .populate({
        path: "course",
        populate: {
          path: "instructor",
          select: "firstName lastName profile.avatar",
        },
      })
      .sort({ lastAccessedAt: -1 })

    const enrolledCourses = progress.map((p) => ({
      ...p.course.toObject(),
      progress: p.overallProgress,
      status: p.status,
      lastAccessedAt: p.lastAccessedAt,
      currentChapter: p.currentChapter,
    }))

    res.json({
      success: true,
      data: enrolledCourses,
    })
  } catch (error) {
    console.error("Enrolled courses fetch error:", error)
    res.status(500).json({
      success: false,
      message: "Server error fetching enrolled courses",
    })
  }
})

// @route   GET /api/courses/:id
// @desc    Get course by ID with full details
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      "instructor",
      "firstName lastName profile.avatar profile.bio",
    )

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    // If user is authenticated, check enrollment status
    let userProgress = null
    if (req.user) {
      userProgress = await Progress.findOne({
        user: req.user.id,
        course: course._id,
      })
    }

    res.json({
      success: true,
      data: {
        course,
        userProgress: userProgress
          ? {
              isEnrolled: true,
              progress: userProgress.overallProgress,
              status: userProgress.status,
              currentChapter: userProgress.currentChapter,
              lastAccessedAt: userProgress.lastAccessedAt,
            }
          : { isEnrolled: false },
      },
    })
  } catch (error) {
    console.error("Course fetch error:", error)
    res.status(500).json({
      success: false,
      message: "Server error fetching course",
    })
  }
})

// @route   POST /api/courses/:id/enroll
// @desc    Enroll user in a course
// @access  Private
router.post("/:id/enroll", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    if (!course.isPublished) {
      return res.status(400).json({
        success: false,
        message: "Course is not available for enrollment",
      })
    }

    // Check if already enrolled
    const existingProgress = await Progress.findOne({
      user: req.user.id,
      course: course._id,
    })

    if (existingProgress) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course",
      })
    }

    // Create progress record
    const progress = new Progress({
      user: req.user.id,
      course: course._id,
      enrolledAt: new Date(),
      status: "not_started",
    })

    await progress.save()

    // Update course enrollment count
    course.enrollmentCount += 1
    await course.save()

    res.status(201).json({
      success: true,
      message: "Successfully enrolled in course",
      data: progress,
    })
  } catch (error) {
    console.error("Course enrollment error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during enrollment",
    })
  }
})

// @route   GET /api/courses/:id/progress
// @desc    Get user's progress for a specific course
// @access  Private
router.get("/:id/progress", auth, async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user: req.user.id,
      course: req.params.id,
    }).populate("course", "title sections")

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Not enrolled in this course",
      })
    }

    res.json({
      success: true,
      data: progress,
    })
  } catch (error) {
    console.error("Progress fetch error:", error)
    res.status(500).json({
      success: false,
      message: "Server error fetching progress",
    })
  }
})

// @route   GET /api/courses/:id/chapters/:chapterId
// @desc    Get chapter content
// @access  Private
router.get("/:id/chapters/:chapterId", auth, async (req, res) => {
  try {
    // Check if user is enrolled
    const progress = await Progress.findOne({
      user: req.user.id,
      course: req.params.id,
    })

    if (!progress) {
      return res.status(403).json({
        success: false,
        message: "Not enrolled in this course",
      })
    }

    const course = await Course.findById(req.params.id)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    const chapter = course.getChapterById(req.params.chapterId)
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found",
      })
    }

    // Get user's progress for this chapter
    const chapterProgress = progress.chaptersProgress.find((cp) => cp.chapter.toString() === req.params.chapterId)

    // Get next and previous chapters
    const nextChapter = course.getNextChapter(req.params.chapterId)
    const previousChapter = course.getPreviousChapter(req.params.chapterId)

    res.json({
      success: true,
      data: {
        chapter,
        progress: chapterProgress || null,
        navigation: {
          nextChapter: nextChapter
            ? {
                id: nextChapter._id,
                title: nextChapter.title,
              }
            : null,
          previousChapter: previousChapter
            ? {
                id: previousChapter._id,
                title: previousChapter.title,
              }
            : null,
        },
      },
    })
  } catch (error) {
    console.error("Chapter fetch error:", error)
    res.status(500).json({
      success: false,
      message: "Server error fetching chapter",
    })
  }
})

// @route   POST /api/courses/:id/chapters/:chapterId/complete
// @desc    Mark chapter as complete
// @access  Private
router.post("/:id/chapters/:chapterId/complete", auth, async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user: req.user.id,
      course: req.params.id,
    })

    if (!progress) {
      return res.status(403).json({
        success: false,
        message: "Not enrolled in this course",
      })
    }

    await progress.updateChapterProgress(req.params.chapterId, {
      isCompleted: true,
      completedAt: new Date(),
      timeSpent: req.body.timeSpent || 0,
    })

    res.json({
      success: true,
      message: "Chapter marked as complete",
      data: progress,
    })
  } catch (error) {
    console.error("Chapter completion error:", error)
    res.status(500).json({
      success: false,
      message: "Server error marking chapter complete",
    })
  }
})

// @route   POST /api/courses/:id/chapters/:chapterId/quiz
// @desc    Submit quiz answer
// @access  Private
router.post(
  "/:id/chapters/:chapterId/quiz",
  auth,
  [body("answer").notEmpty().withMessage("Answer is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const progress = await Progress.findOne({
        user: req.user.id,
        course: req.params.id,
      })

      if (!progress) {
        return res.status(403).json({
          success: false,
          message: "Not enrolled in this course",
        })
      }

      const course = await Course.findById(req.params.id)
      const chapter = course.getChapterById(req.params.chapterId)

      if (!chapter || !chapter.quiz) {
        return res.status(404).json({
          success: false,
          message: "Quiz not found",
        })
      }

      const { answer } = req.body
      const isCorrect = Number.parseInt(answer) === chapter.quiz.correctAnswer
      const points = isCorrect ? chapter.quiz.points : 0

      const quizAttempt = {
        question: chapter.quiz.question,
        selectedAnswer: Number.parseInt(answer),
        correctAnswer: chapter.quiz.correctAnswer,
        isCorrect,
        points,
        attemptedAt: new Date(),
      }

      await progress.addQuizAttempt(req.params.chapterId, quizAttempt)

      res.json({
        success: true,
        data: {
          isCorrect,
          points,
          correctAnswer: chapter.quiz.correctAnswer,
          explanation: chapter.quiz.explanation,
        },
      })
    } catch (error) {
      console.error("Quiz submission error:", error)
      res.status(500).json({
        success: false,
        message: "Server error submitting quiz",
      })
    }
  },
)

module.exports = router
