const express = require("express")
const Progress = require("../models/Progress")
const Course = require("../models/Course")
const { auth } = require("../middleware/auth")
const { body, validationResult } = require("express-validator")

const router = express.Router()

// @route   GET /api/progress
// @desc    Get user's overall progress
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.user.id })
      .populate("course", "title thumbnail category level")
      .sort({ lastAccessedAt: -1 })

    // Calculate overall statistics
    const stats = {
      totalCourses: progress.length,
      completedCourses: progress.filter((p) => p.status === "completed").length,
      inProgressCourses: progress.filter((p) => p.status === "in_progress").length,
      totalTimeSpent: progress.reduce((total, p) => total + p.totalTimeSpent, 0),
      averageProgress:
        progress.length > 0 ? progress.reduce((total, p) => total + p.overallProgress, 0) / progress.length : 0,
    }

    res.json({
      success: true,
      data: {
        progress,
        stats,
      },
    })
  } catch (error) {
    console.error("Progress fetch error:", error)
    res.status(500).json({
      success: false,
      message: "Server error fetching progress",
    })
  }
})

// @route   POST /api/progress
// @desc    Update user progress
// @access  Private
router.post(
  "/",
  auth,
  [
    body("courseId").notEmpty().withMessage("Course ID is required"),
    body("chapterId").notEmpty().withMessage("Chapter ID is required"),
  ],
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

      const { courseId, chapterId, timeSpent, isCompleted, notes } = req.body

      // Find or create progress record
      let progress = await Progress.findOne({
        user: req.user.id,
        course: courseId,
      })

      if (!progress) {
        progress = new Progress({
          user: req.user.id,
          course: courseId,
          enrolledAt: new Date(),
          status: "not_started",
        })
      }

      // Update chapter progress
      await progress.updateChapterProgress(chapterId, {
        timeSpent: timeSpent || 0,
        isCompleted: isCompleted || false,
        notes: notes || "",
        completedAt: isCompleted ? new Date() : undefined,
      })

      res.json({
        success: true,
        message: "Progress updated successfully",
        data: progress,
      })
    } catch (error) {
      console.error("Progress update error:", error)
      res.status(500).json({
        success: false,
        message: "Server error updating progress",
      })
    }
  },
)

// @route   GET /api/progress/analytics/:courseId
// @desc    Get course analytics for instructors
// @access  Private
router.get("/analytics/:courseId", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    // Check if user is instructor of this course
    if (course.instructor.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      })
    }

    const analytics = await Progress.getCourseAnalytics(req.params.courseId)

    res.json({
      success: true,
      data: analytics[0] || {
        totalEnrollments: 0,
        completedCount: 0,
        averageProgress: 0,
        averageTimeSpent: 0,
        dropoutCount: 0,
        completionRate: 0,
        dropoutRate: 0,
      },
    })
  } catch (error) {
    console.error("Analytics fetch error:", error)
    res.status(500).json({
      success: false,
      message: "Server error fetching analytics",
    })
  }
})

// @route   GET /api/progress/dashboard
// @desc    Get dashboard statistics
// @access  Private
router.get("/dashboard", auth, async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.user.id })

    const stats = {
      enrolledCourses: progress.length,
      completedCourses: progress.filter((p) => p.status === "completed").length,
      hoursLearned: Math.round(progress.reduce((total, p) => total + p.totalTimeSpent, 0) / 3600), // Convert seconds to hours
      certificates: progress.filter((p) => p.certificateIssued).length,
      currentStreak: 7, // Mock data - would calculate based on daily activity
      weeklyGoal: 10, // Mock data - would come from user preferences
    }

    // Recent activity
    const recentActivity = await Progress.find({ user: req.user.id })
      .populate("course", "title thumbnail")
      .sort({ lastAccessedAt: -1 })
      .limit(5)

    res.json({
      success: true,
      data: {
        stats,
        recentActivity,
      },
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    res.status(500).json({
      success: false,
      message: "Server error fetching dashboard stats",
    })
  }
})

module.exports = router
