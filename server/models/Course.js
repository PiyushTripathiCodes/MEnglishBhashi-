const mongoose = require("mongoose")

const chapterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Chapter title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Chapter description is required"],
    },
    type: {
      type: String,
      enum: ["video", "reading", "quiz", "assignment"],
      required: true,
    },
    content: {
      // For video chapters
      videoUrl: String,
      videoDuration: Number, // in seconds
      transcript: String,

      // For reading chapters
      text: String,
      estimatedReadTime: Number, // in minutes

      // For all chapters
      resources: [
        {
          title: String,
          url: String,
          type: {
            type: String,
            enum: ["pdf", "link", "download"],
          },
        },
      ],
    },
    quiz: {
      question: String,
      options: [String],
      correctAnswer: Number,
      explanation: String,
      points: {
        type: Number,
        default: 10,
      },
    },
    activity: {
      type: {
        type: String,
        enum: ["coding", "essay", "project"],
      },
      prompt: String,
      starterCode: String,
      solution: String,
      testCases: [
        {
          input: String,
          expectedOutput: String,
        },
      ],
      rubric: [
        {
          criteria: String,
          points: Number,
        },
      ],
    },
    order: {
      type: Number,
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chapter",
      },
    ],
  },
  {
    timestamps: true,
  },
)

const unitSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Unit title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Unit description is required"],
    },
    chapters: [chapterSchema],
    order: {
      type: Number,
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

const sectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Section title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Section description is required"],
    },
    units: [unitSchema],
    order: {
      type: Number,
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      maxlength: [100, "Course title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      maxlength: [1000, "Course description cannot exceed 1000 characters"],
    },
    shortDescription: {
      type: String,
      maxlength: [200, "Short description cannot exceed 200 characters"],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Instructor is required"],
    },
    category: {
      type: String,
      required: [true, "Course category is required"],
      enum: ["web-development", "mobile-development", "data-science", "design", "business", "other"],
    },
    level: {
      type: String,
      required: [true, "Course level is required"],
      enum: ["Beginner", "Intermediate", "Advanced"],
    },
    tags: [String],
    sections: [sectionSchema],
    pricing: {
      type: {
        type: String,
        enum: ["free", "paid"],
        default: "free",
      },
      amount: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: "USD",
      },
    },
    thumbnail: {
      type: String,
      default: "/placeholder.svg?height=300&width=500",
    },
    previewVideo: String,
    duration: {
      type: Number, // Total duration in hours
      default: 0,
    },
    language: {
      type: String,
      default: "English",
    },
    requirements: [String],
    learningOutcomes: [String],
    targetAudience: [String],
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: Date,
    enrollmentCount: {
      type: Number,
      default: 0,
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    certificate: {
      enabled: {
        type: Boolean,
        default: false,
      },
      template: String,
      completionThreshold: {
        type: Number,
        default: 80, // Percentage
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Virtual for total chapters count
courseSchema.virtual("totalChapters").get(function () {
  return this.sections.reduce((total, section) => {
    return (
      total +
      section.units.reduce((unitTotal, unit) => {
        return unitTotal + unit.chapters.length
      }, 0)
    )
  }, 0)
})

// Virtual for estimated duration
courseSchema.virtual("estimatedDuration").get(function () {
  const totalMinutes = this.sections.reduce((total, section) => {
    return (
      total +
      section.units.reduce((unitTotal, unit) => {
        return (
          unitTotal +
          unit.chapters.reduce((chapterTotal, chapter) => {
            if (chapter.type === "video" && chapter.content.videoDuration) {
              return chapterTotal + chapter.content.videoDuration / 60 // Convert seconds to minutes
            }
            if (chapter.type === "reading" && chapter.content.estimatedReadTime) {
              return chapterTotal + chapter.content.estimatedReadTime
            }
            return chapterTotal + 10 // Default 10 minutes for other types
          }, 0)
        )
      }, 0)
    )
  }, 0)

  return Math.ceil(totalMinutes / 60) // Convert to hours
})

// Indexes for better query performance
courseSchema.index({ title: "text", description: "text" })
courseSchema.index({ category: 1, level: 1 })
courseSchema.index({ instructor: 1 })
courseSchema.index({ isPublished: 1, publishedAt: -1 })
courseSchema.index({ "rating.average": -1 })

// Pre-save middleware to update duration
courseSchema.pre("save", function (next) {
  this.duration = this.estimatedDuration
  next()
})

// Method to get chapter by ID
courseSchema.methods.getChapterById = function (chapterId) {
  for (const section of this.sections) {
    for (const unit of section.units) {
      const chapter = unit.chapters.id(chapterId)
      if (chapter) {
        return chapter
      }
    }
  }
  return null
}

// Method to get next chapter
courseSchema.methods.getNextChapter = function (currentChapterId) {
  let foundCurrent = false

  for (const section of this.sections) {
    for (const unit of section.units) {
      for (const chapter of unit.chapters) {
        if (foundCurrent) {
          return chapter
        }
        if (chapter._id.toString() === currentChapterId.toString()) {
          foundCurrent = true
        }
      }
    }
  }

  return null
}

// Method to get previous chapter
courseSchema.methods.getPreviousChapter = function (currentChapterId) {
  let previousChapter = null

  for (const section of this.sections) {
    for (const unit of section.units) {
      for (const chapter of unit.chapters) {
        if (chapter._id.toString() === currentChapterId.toString()) {
          return previousChapter
        }
        previousChapter = chapter
      }
    }
  }

  return null
}

module.exports = mongoose.model("Course", courseSchema)
