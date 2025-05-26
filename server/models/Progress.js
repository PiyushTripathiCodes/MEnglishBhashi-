const mongoose = require("mongoose")

const quizAttemptSchema = new mongoose.Schema({
  question: String,
  selectedAnswer: Number,
  correctAnswer: Number,
  isCorrect: Boolean,
  points: Number,
  attemptedAt: {
    type: Date,
    default: Date.now,
  },
})

const activitySubmissionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["coding", "essay", "project"],
  },
  submission: mongoose.Schema.Types.Mixed, // Can store code, text, or file references
  feedback: String,
  grade: Number,
  maxGrade: Number,
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  gradedAt: Date,
})

const chapterProgressSchema = new mongoose.Schema({
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: Date,
  timeSpent: {
    type: Number, // in seconds
    default: 0,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  quizAttempts: [quizAttemptSchema],
  activitySubmissions: [activitySubmissionSchema],
  notes: String,
  bookmarks: [
    {
      timestamp: Number, // For video bookmarks
      note: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  lastPosition: {
    type: Number, // For video progress
    default: 0,
  },
})

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    startedAt: Date,
    completedAt: Date,
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    currentChapter: {
      type: mongoose.Schema.Types.ObjectId,
    },
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    chaptersProgress: [chapterProgressSchema],
    totalTimeSpent: {
      type: Number, // in seconds
      default: 0,
    },
    certificateIssued: {
      type: Boolean,
      default: false,
    },
    certificateIssuedAt: Date,
    certificateId: String,
    finalGrade: Number,
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed", "dropped"],
      default: "not_started",
    },
  },
  {
    timestamps: true,
  },
)

// Compound index for unique user-course combination
progressSchema.index({ user: 1, course: 1 }, { unique: true })

// Indexes for better query performance
progressSchema.index({ user: 1, status: 1 })
progressSchema.index({ course: 1, overallProgress: -1 })
progressSchema.index({ lastAccessedAt: -1 })

// Virtual for completion percentage
progressSchema.virtual("completionPercentage").get(function () {
  if (this.chaptersProgress.length === 0) return 0

  const completedChapters = this.chaptersProgress.filter((cp) => cp.isCompleted).length
  return Math.round((completedChapters / this.chaptersProgress.length) * 100)
})

// Method to update chapter progress
progressSchema.methods.updateChapterProgress = function (chapterId, progressData) {
  let chapterProgress = this.chaptersProgress.find((cp) => cp.chapter.toString() === chapterId.toString())

  if (!chapterProgress) {
    chapterProgress = {
      chapter: chapterId,
      startedAt: new Date(),
      timeSpent: 0,
      isCompleted: false,
      quizAttempts: [],
      activitySubmissions: [],
      bookmarks: [],
      lastPosition: 0,
    }
    this.chaptersProgress.push(chapterProgress)
  }

  // Update progress data
  Object.assign(chapterProgress, progressData)

  // Update overall progress
  this.overallProgress = this.completionPercentage

  // Update status
  if (this.status === "not_started") {
    this.status = "in_progress"
    this.startedAt = new Date()
  }

  if (this.overallProgress === 100 && this.status !== "completed") {
    this.status = "completed"
    this.completedAt = new Date()
  }

  // Update last accessed
  this.lastAccessedAt = new Date()
  this.currentChapter = chapterId

  return this.save()
}

// Method to add quiz attempt
progressSchema.methods.addQuizAttempt = function (chapterId, quizData) {
  let chapterProgress = this.chaptersProgress.find((cp) => cp.chapter.toString() === chapterId.toString())

  if (!chapterProgress) {
    chapterProgress = {
      chapter: chapterId,
      startedAt: new Date(),
      timeSpent: 0,
      isCompleted: false,
      quizAttempts: [],
      activitySubmissions: [],
      bookmarks: [],
      lastPosition: 0,
    }
    this.chaptersProgress.push(chapterProgress)
  }

  chapterProgress.quizAttempts.push(quizData)

  return this.save()
}

// Method to add activity submission
progressSchema.methods.addActivitySubmission = function (chapterId, submissionData) {
  let chapterProgress = this.chaptersProgress.find((cp) => cp.chapter.toString() === chapterId.toString())

  if (!chapterProgress) {
    chapterProgress = {
      chapter: chapterId,
      startedAt: new Date(),
      timeSpent: 0,
      isCompleted: false,
      quizAttempts: [],
      activitySubmissions: [],
      bookmarks: [],
      lastPosition: 0,
    }
    this.chaptersProgress.push(chapterProgress)
  }

  chapterProgress.activitySubmissions.push(submissionData)

  return this.save()
}

// Static method to get course analytics
progressSchema.statics.getCourseAnalytics = function (courseId) {
  return this.aggregate([
    { $match: { course: mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: "$course",
        totalEnrollments: { $sum: 1 },
        completedCount: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
        averageProgress: { $avg: "$overallProgress" },
        averageTimeSpent: { $avg: "$totalTimeSpent" },
        dropoutCount: {
          $sum: { $cond: [{ $eq: ["$status", "dropped"] }, 1, 0] },
        },
      },
    },
    {
      $addFields: {
        completionRate: {
          $multiply: [{ $divide: ["$completedCount", "$totalEnrollments"] }, 100],
        },
        dropoutRate: {
          $multiply: [{ $divide: ["$dropoutCount", "$totalEnrollments"] }, 100],
        },
      },
    },
  ])
}

module.exports = mongoose.model("Progress", progressSchema)
