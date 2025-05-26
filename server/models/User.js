const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't include password in queries by default
    },
    enrolledCourses: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
        progress: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
        completedChapters: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chapter",
          },
        ],
        lastAccessedChapter: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Chapter",
        },
      },
    ],
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },
    profile: {
      avatar: String,
      bio: String,
      skills: [String],
      socialLinks: {
        linkedin: String,
        github: String,
        website: String,
      },
    },
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
    },
    lastLogin: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Virtual for full name
userSchema.virtual("name").get(function () {
  return `${this.firstName} ${this.lastName}`
})

// Index for better query performance
userSchema.index({ email: 1 })
userSchema.index({ "enrolledCourses.course": 1 })

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Method to enroll in a course
userSchema.methods.enrollInCourse = function (courseId) {
  const isEnrolled = this.enrolledCourses.some((enrollment) => enrollment.course.toString() === courseId.toString())

  if (!isEnrolled) {
    this.enrolledCourses.push({
      course: courseId,
      enrolledAt: new Date(),
      progress: 0,
      completedChapters: [],
    })
  }

  return this.save()
}

// Method to update course progress
userSchema.methods.updateCourseProgress = function (courseId, chapterId, progressData) {
  const enrollment = this.enrolledCourses.find((enrollment) => enrollment.course.toString() === courseId.toString())

  if (enrollment) {
    // Add chapter to completed if not already there
    if (progressData.completed && !enrollment.completedChapters.includes(chapterId)) {
      enrollment.completedChapters.push(chapterId)
    }

    // Update last accessed chapter
    enrollment.lastAccessedChapter = chapterId

    // Update overall progress
    if (progressData.progress !== undefined) {
      enrollment.progress = progressData.progress
    }
  }

  return this.save()
}

module.exports = mongoose.model("User", userSchema)
