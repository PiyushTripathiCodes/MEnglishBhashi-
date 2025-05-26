const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
require("dotenv").config()

// Import models
const User = require("../models/User")
const Course = require("../models/Course")
const Progress = require("../models/Progress")

// Sample data
const sampleUsers = [
  {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    password: "password123",
    role: "student",
  },
  {
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@example.com",
    password: "password123",
    role: "student",
  },
  {
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah@example.com",
    password: "password123",
    role: "instructor",
  },
  {
    firstName: "Michael",
    lastName: "Chen",
    email: "michael@example.com",
    password: "password123",
    role: "instructor",
  },
]

const sampleCourses = [
  {
    title: "Full Stack Web Development",
    description:
      "Learn to build modern web applications with React, Node.js, and MongoDB. This comprehensive course covers everything from frontend development to backend APIs and database management.",
    shortDescription: "Master full-stack development with React, Node.js, and MongoDB",
    category: "web-development",
    level: "Intermediate",
    tags: ["React", "Node.js", "MongoDB", "JavaScript", "Full Stack"],
    thumbnail: "/placeholder.svg?height=300&width=500",
    duration: 12,
    language: "English",
    requirements: ["Basic JavaScript knowledge", "HTML/CSS fundamentals", "Git basics"],
    learningOutcomes: [
      "Build full-stack web applications",
      "Master React and modern JavaScript",
      "Create RESTful APIs with Node.js",
      "Work with MongoDB databases",
      "Deploy applications to production",
    ],
    targetAudience: [
      "Aspiring web developers",
      "Frontend developers wanting to learn backend",
      "Computer science students",
    ],
    isPublished: true,
    publishedAt: new Date(),
    sections: [
      {
        title: "Frontend Development",
        description: "Master modern frontend technologies",
        order: 1,
        isPublished: true,
        units: [
          {
            title: "React Fundamentals",
            description: "Learn the basics of React",
            order: 1,
            isPublished: true,
            chapters: [
              {
                title: "Introduction to React",
                description: "Understanding React and its ecosystem",
                type: "video",
                content: {
                  videoUrl: "/placeholder.svg?height=400&width=600",
                  videoDuration: 900, // 15 minutes
                  description:
                    "Welcome to React! In this chapter, we'll explore what React is and why it's become one of the most popular JavaScript libraries for building user interfaces.",
                  transcript:
                    "React is a JavaScript library for building user interfaces. It was created by Facebook and is now maintained by Facebook and the community...",
                },
                quiz: {
                  question: "What is React primarily used for?",
                  options: [
                    "Building mobile applications",
                    "Building user interfaces",
                    "Database management",
                    "Server-side programming",
                  ],
                  correctAnswer: 1,
                  explanation:
                    "React is primarily a JavaScript library for building user interfaces, especially for web applications.",
                  points: 10,
                },
                order: 1,
                isPublished: true,
              },
              {
                title: "Components and JSX",
                description: "Learn about React components and JSX syntax",
                type: "reading",
                content: {
                  text: `# Components and JSX

React applications are built using components. A component is a reusable piece of code that returns a React element to be rendered to the page.

## What is JSX?

JSX stands for JavaScript XML. It allows us to write HTML-like syntax directly in our JavaScript code. Here's an example:

\`\`\`jsx
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}
\`\`\`

## Key Points:

1. JSX makes React code more readable
2. Components can be reused throughout your application
3. Props allow you to pass data to components
4. JSX expressions must be wrapped in parentheses when spanning multiple lines

## Exercise

Try creating your own component that displays a greeting message.`,
                  estimatedReadTime: 5,
                },
                activity: {
                  type: "coding",
                  prompt:
                    "Create a React component called 'Greeting' that accepts a 'name' prop and displays 'Hello, [name]!' in an h1 element.",
                  starterCode: "function Greeting(props) {\n  // Your code here\n}",
                  solution: "function Greeting(props) {\n  return <h1>Hello, {props.name}!</h1>;\n}",
                },
                order: 2,
                isPublished: true,
              },
              {
                title: "Props and State",
                description: "Understanding data flow in React",
                type: "video",
                content: {
                  videoUrl: "/placeholder.svg?height=400&width=600",
                  videoDuration: 1500, // 25 minutes
                  description: "Learn how to pass data between components using props and manage component state.",
                },
                quiz: {
                  question: "What is the difference between props and state?",
                  options: [
                    "Props are mutable, state is immutable",
                    "Props are passed from parent, state is internal",
                    "Props are for styling, state is for data",
                    "There is no difference",
                  ],
                  correctAnswer: 1,
                  explanation:
                    "Props are passed down from parent components and are immutable, while state is internal to a component and can be changed.",
                  points: 10,
                },
                order: 3,
                isPublished: true,
              },
            ],
          },
          {
            title: "Advanced React",
            description: "Dive deeper into React concepts",
            order: 2,
            isPublished: true,
            chapters: [
              {
                title: "Hooks in Detail",
                description: "Master React Hooks",
                type: "video",
                content: {
                  videoUrl: "/placeholder.svg?height=400&width=600",
                  videoDuration: 1800, // 30 minutes
                  description: "Deep dive into React Hooks including useState, useEffect, and custom hooks.",
                },
                order: 1,
                isPublished: true,
              },
              {
                title: "Context API",
                description: "Global state management with Context",
                type: "reading",
                content: {
                  text: "# React Context API\n\nThe Context API provides a way to pass data through the component tree without having to pass props down manually at every level...",
                  estimatedReadTime: 8,
                },
                order: 2,
                isPublished: true,
              },
            ],
          },
        ],
      },
      {
        title: "Backend Development",
        description: "Build robust server-side applications",
        order: 2,
        isPublished: true,
        units: [
          {
            title: "Node.js Basics",
            description: "Introduction to server-side JavaScript",
            order: 1,
            isPublished: true,
            chapters: [
              {
                title: "Setting up Node.js",
                description: "Environment setup and basics",
                type: "video",
                content: {
                  videoUrl: "/placeholder.svg?height=400&width=600",
                  videoDuration: 720, // 12 minutes
                  description: "Learn how to set up Node.js development environment and understand the basics.",
                },
                order: 1,
                isPublished: true,
              },
              {
                title: "Express.js Framework",
                description: "Building web servers with Express",
                type: "video",
                content: {
                  videoUrl: "/placeholder.svg?height=400&width=600",
                  videoDuration: 1500, // 25 minutes
                  description: "Introduction to Express.js framework for building web applications and APIs.",
                },
                order: 2,
                isPublished: true,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Data Science with Python",
    description:
      "Master data analysis, visualization, and machine learning with Python. Learn to work with real datasets and build predictive models.",
    shortDescription: "Complete data science course with Python, pandas, and machine learning",
    category: "data-science",
    level: "Beginner",
    tags: ["Python", "Data Science", "Machine Learning", "Pandas", "NumPy"],
    thumbnail: "/placeholder.svg?height=300&width=500",
    duration: 10,
    language: "English",
    requirements: ["Basic programming knowledge", "High school mathematics"],
    learningOutcomes: [
      "Analyze data with Python and pandas",
      "Create data visualizations",
      "Build machine learning models",
      "Work with real-world datasets",
    ],
    targetAudience: ["Data enthusiasts", "Business analysts", "Students"],
    isPublished: true,
    publishedAt: new Date(),
    sections: [
      {
        title: "Python Fundamentals",
        description: "Learn Python basics for data science",
        order: 1,
        isPublished: true,
        units: [
          {
            title: "Getting Started",
            description: "Python setup and basics",
            order: 1,
            isPublished: true,
            chapters: [
              {
                title: "Python Installation",
                description: "Setting up Python environment",
                type: "video",
                content: {
                  videoUrl: "/placeholder.svg?height=400&width=600",
                  videoDuration: 600,
                  description: "Learn how to install Python and set up your development environment.",
                },
                order: 1,
                isPublished: true,
              },
            ],
          },
        ],
      },
    ],
  },
]

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/learnhub")
    console.log("Connected to MongoDB")

    // Clear existing data
    await User.deleteMany({})
    await Course.deleteMany({})
    await Progress.deleteMany({})
    console.log("Cleared existing data")

    // Create users
    const users = []
    for (const userData of sampleUsers) {
      const user = new User(userData)
      await user.save()
      users.push(user)
      console.log(`Created user: ${user.email}`)
    }

    // Create courses
    const courses = []
    for (const courseData of sampleCourses) {
      // Assign instructor (find instructor users)
      const instructor = users.find((user) => user.role === "instructor")
      courseData.instructor = instructor._id

      const course = new Course(courseData)
      await course.save()
      courses.push(course)
      console.log(`Created course: ${course.title}`)
    }

    // Create some sample progress records
    const studentUsers = users.filter((user) => user.role === "student")
    for (const student of studentUsers) {
      for (const course of courses.slice(0, 2)) {
        // Enroll in first 2 courses
        const progress = new Progress({
          user: student._id,
          course: course._id,
          enrolledAt: new Date(),
          status: "in_progress",
          overallProgress: Math.floor(Math.random() * 50) + 10, // Random progress between 10-60%
        })
        await progress.save()
        console.log(`Created progress for ${student.email} in ${course.title}`)
      }
    }

    console.log("Database seeded successfully!")
    process.exit(0)
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  }
}

// Run the seed function
seedDatabase()
