# 🎓 LearnHub - MERN Stack Learning Platform

A comprehensive, modern learning management system built with the MERN stack (MongoDB, Express.js, React, Node.js). LearnHub provides a complete solution for online education with interactive courses, progress tracking, and analytics.

![LearnHub Banner](https://via.placeholder.com/1200x400/4F46E5/FFFFFF?text=LearnHub+-+Modern+Learning+Platform)

## 🌟 Features

### 👨‍🎓 For Students
- **Interactive Learning**: Video lessons, reading materials, quizzes, and hands-on activities
- **Progress Tracking**: Real-time progress monitoring with visual indicators
- **Personalized Dashboard**: Track enrolled courses, achievements, and learning statistics
- **Responsive Design**: Learn on any device - desktop, tablet, or mobile
- **Search & Filter**: Find courses by category, level, or keywords

### 👨‍🏫 For Instructors
- **Course Creation**: Build structured courses with sections, units, and chapters
- **Content Management**: Support for multiple content types (video, text, quizzes, activities)
- **Analytics Dashboard**: Monitor student progress and course performance
- **Student Management**: Track enrollment and engagement metrics

### 🔧 For Administrators
- **Platform Management**: Comprehensive admin dashboard
- **User Management**: Manage students, instructors, and permissions
- **Course Oversight**: Monitor all courses and platform activity
- **Analytics & Reporting**: Detailed insights into platform performance

## 🚀 Live Demo

### 🌐 **Deployed Applications**
- **Frontend**: [https://learnhub-frontend.vercel.app](https://learnhub-frontend.vercel.app) ✅ **LIVE**
- **Backend API**: [https://learnhub-backend-production.up.railway.app](https://learnhub-backend-production.up.railway.app) ✅ **LIVE**
- **API Health Check**: [https://learnhub-backend-production.up.railway.app/api/health](https://learnhub-backend-production.up.railway.app/api/health)

### 📱 **Quick Access**
🔗 **Main Application**: [https://learnhub-frontend.vercel.app](https://learnhub-frontend.vercel.app)

### 🔐 **Demo Accounts**
\`\`\`
Student Account:
Email: john@example.com
Password: password123

Instructor Account:
Email: sarah@example.com
Password: password123

Admin Account:
Email: admin@learnhub.com
Password: password123
\`\`\`

### ✅ **Deployment Status**
- **Frontend (Vercel)**: ✅ Successfully deployed and running
- **Backend (Railway)**: ✅ Successfully deployed and running  
- **Database (MongoDB Atlas)**: ✅ Connected and seeded with sample data
- **API Integration**: ✅ Frontend successfully connected to backend
- **Authentication**: ✅ JWT authentication working
- **Course System**: ✅ Full CRUD operations functional
- **Progress Tracking**: ✅ Real-time progress updates working

### 🎯 **What You Can Test**
1. **User Registration/Login** - Create new accounts or use demo accounts
2. **Course Browsing** - Explore available courses with search and filters
3. **Course Enrollment** - Enroll in courses and track progress
4. **Interactive Learning** - Complete chapters, quizzes, and activities
5. **Progress Tracking** - View learning analytics and achievements
6. **Admin Dashboard** - Manage courses and view platform analytics (admin account)

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing

### DevOps & Deployment
- **Vercel** - Frontend deployment
- **Railway** - Backend deployment
- **MongoDB Atlas** - Cloud database
- **Git** - Version control

## 📁 Project Structure

\`\`\`
learnhub/
├── app/                          # Next.js app directory
│   ├── (auth)/
│   │   ├── login/               # Login page
│   │   └── register/            # Registration page
│   ├── courses/
│   │   ├── [id]/               # Course details
│   │   │   └── learn/          # Learning interface
│   │   └── page.tsx            # Course catalog
│   ├── dashboard/              # Student dashboard
│   ├── profile/                # User profile
│   ├── admin/                  # Admin dashboard
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── components/
│   ├── ui/                     # Reusable UI components
│   ├── protected-route.tsx     # Route protection
│   └── theme-provider.tsx      # Theme management
├── lib/
│   ├── api.ts                  # API client functions
│   ├── auth-context.tsx        # Authentication context
│   └── utils.ts                # Utility functions
├── server/                     # Backend application
│   ├── models/                 # MongoDB schemas
│   │   ├── User.js
│   │   ├── Course.js
│   │   └── Progress.js
│   ├── routes/                 # API routes
│   │   ├── auth.js
│   │   ├── courses.js
│   │   └── progress.js
│   ├── middleware/             # Custom middleware
│   ├── scripts/                # Database scripts
│   └── app.js                  # Express application
└── README.md
\`\`\`

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- MongoDB (local or Atlas)
- Git

### 1. Clone the Repository
\`\`\`bash
git clone https://github.com/yourusername/learnhub.git
cd learnhub
\`\`\`

### 2. Backend Setup
\`\`\`bash
cd server
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret_key
# JWT_EXPIRE=7d
# PORT=5000

# Seed the database with sample data
npm run seed

# Start the development server
npm run dev
\`\`\`

### 3. Frontend Setup
\`\`\`bash
# In a new terminal, from the root directory
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local

# Start the development server
npm run dev
\`\`\`

### 4. Access the Application
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000](http://localhost:5000)
- API Health Check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

## 🔧 Environment Variables

### Frontend (.env.local)
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
\`\`\`

### Backend (.env)
\`\`\`env
MONGODB_URI=mongodb://localhost:27017/learnhub
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
\`\`\`

## 📊 Database Schema

### User Model
\`\`\`javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  role: ['student', 'instructor', 'admin'],
  enrolledCourses: [CourseEnrollment],
  profile: {
    avatar: String,
    bio: String,
    skills: [String]
  }
}
\`\`\`

### Course Model
\`\`\`javascript
{
  title: String,
  description: String,
  instructor: ObjectId (User),
  category: String,
  level: ['Beginner', 'Intermediate', 'Advanced'],
  sections: [{
    title: String,
    units: [{
      title: String,
      chapters: [{
        title: String,
        type: ['video', 'reading', 'quiz', 'assignment'],
        content: Mixed,
        quiz: QuizSchema,
        activity: ActivitySchema
      }]
    }]
  }]
}
\`\`\`

### Progress Model
\`\`\`javascript
{
  user: ObjectId (User),
  course: ObjectId (Course),
  overallProgress: Number,
  chaptersProgress: [{
    chapter: ObjectId,
    isCompleted: Boolean,
    timeSpent: Number,
    quizAttempts: [QuizAttempt],
    activitySubmissions: [ActivitySubmission]
  }],
  status: ['not_started', 'in_progress', 'completed']
}
\`\`\`

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

### Courses
- `GET /api/courses` - Get all courses (with filters)
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses/:id/enroll` - Enroll in course
- `GET /api/courses/enrolled` - Get enrolled courses
- `GET /api/courses/:id/progress` - Get course progress

### Learning
- `GET /api/courses/:id/chapters/:chapterId` - Get chapter content
- `POST /api/courses/:id/chapters/:chapterId/complete` - Mark chapter complete
- `POST /api/courses/:id/chapters/:chapterId/quiz` - Submit quiz answer
- `POST /api/courses/:id/chapters/:chapterId/activity` - Submit activity

### Progress
- `GET /api/progress` - Get user progress
- `POST /api/progress` - Update progress
- `GET /api/progress/analytics/:courseId` - Get course analytics

## 🎨 UI Components

LearnHub uses a modern design system built with:

- **shadcn/ui** - High-quality, accessible components
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Unstyled, accessible primitives
- **Lucide React** - Beautiful, customizable icons

### Key Components
- `Button` - Various button styles and sizes
- `Card` - Content containers
- `Input` - Form inputs with validation
- `Progress` - Progress bars and indicators
- `Tabs` - Tabbed interfaces
- `Alert` - Notification messages
- `Badge` - Status indicators

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **Input Validation** - express-validator middleware
- **Rate Limiting** - Prevent API abuse
- **CORS Protection** - Cross-origin request security
- **Data Sanitization** - MongoDB injection prevention
- **Helmet.js** - Security headers

## 📱 Responsive Design

LearnHub is fully responsive and works seamlessly across:
- **Desktop** (1024px+)
- **Tablet** (768px - 1023px)
- **Mobile** (320px - 767px)

## 🧪 Testing

### Running Tests
\`\`\`bash
# Backend tests
cd server
npm test

# Frontend tests
npm test
\`\`\`

### Test Coverage
- Unit tests for API endpoints
- Integration tests for database operations
- Component tests for React components
- E2E tests for user workflows

## 🚀 Deployment

### Frontend (Vercel)
\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
\`\`\`

### Backend (Railway)
\`\`\`bash
# Connect to Railway
railway login
railway link

# Deploy
railway up
\`\`\`

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get connection string
4. Update MONGODB_URI in environment variables

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Frontend Development** - React/Next.js, TypeScript, Tailwind CSS
- **Backend Development** - Node.js, Express.js, MongoDB
- **UI/UX Design** - Modern, accessible design system
- **DevOps** - Deployment and infrastructure

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Vercel](https://vercel.com/) - Frontend hosting
- [Railway](https://railway.app/) - Backend hosting

## 📞 Support

If you have any questions or need help:

- 📧 Email: support@learnhub.com
- 💬 Discord: [Join our community](https://discord.gg/learnhub)
- 📖 Documentation: [docs.learnhub.com](https://docs.learnhub.com)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/learnhub/issues)

## 🗺️ Roadmap

### Phase 1 ✅ (Completed)
- [x] User authentication and authorization
- [x] Course management system
- [x] Interactive learning experience
- [x] Progress tracking
- [x] Responsive design
- [x] Admin dashboard

### Phase 2 🚧 (In Progress)
- [ ] Payment integration (Stripe)
- [ ] Certificate generation
- [ ] Advanced analytics
- [ ] Mobile app development

### Phase 3 📋 (Planned)
- [ ] Real-time notifications
- [ ] Video streaming
- [ ] AI-powered recommendations
- [ ] Discussion forums
- [ ] Live streaming classes

---

**Made with ❤️ by the LearnHub Team**

⭐ Star this repository if you found it helpful!
