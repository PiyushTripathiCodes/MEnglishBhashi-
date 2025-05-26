# 🎓 LearnHub - Local Development Setup

## Quick Start Guide

### Prerequisites
- Node.js 16+ installed
- MongoDB running locally (or MongoDB Atlas account)
- Git (optional)

### Option 1: Using Scripts (Recommended)

#### For Windows:
1. **Start Backend** (Terminal 1):
   ```cmd
   start-backend.bat
   \`\`\`

2. **Start Frontend** (Terminal 2):
   ```cmd
   start-frontend.bat
   \`\`\`

#### For Mac/Linux:
1. **Make scripts executable**:
   \`\`\`bash
   chmod +x start-backend.sh start-frontend.sh
   \`\`\`

2. **Start Backend** (Terminal 1):
   \`\`\`bash
   ./start-backend.sh
   \`\`\`

3. **Start Frontend** (Terminal 2):
   \`\`\`bash
   ./start-frontend.sh
   \`\`\`

### Option 2: Manual Commands

#### Terminal 1 - Backend:
\`\`\`bash
cd server
npm install
npm run seed
npm run dev
\`\`\`

#### Terminal 2 - Frontend:
\`\`\`bash
npm install
npm run dev
\`\`\`

## Access Points

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## Demo Accounts

\`\`\`
Student Account:
Email: john@example.com
Password: password123

Instructor Account:
Email: sarah@example.com
Password: password123
\`\`\`

## Success Indicators

### Backend Terminal Should Show:
\`\`\`
🚀 Server running on port 5000
✅ MongoDB connected successfully
📊 Database: learnhub
\`\`\`

### Frontend Terminal Should Show:
\`\`\`
▲ Next.js 14.0.0
- Local: http://localhost:3000
✓ Ready in 2.3s
\`\`\`

## Troubleshooting

### Port Already in Use:
\`\`\`bash
# Frontend on different port
npm run dev -- -p 3001

# Backend on different port
PORT=5001 npm run dev
\`\`\`

### MongoDB Connection Issues:
- Make sure MongoDB is running locally
- Or update `MONGODB_URI` in `server/.env` to use MongoDB Atlas

### Module Not Found Errors:
\`\`\`bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
\`\`\`

### Environment Variables Missing:
Make sure these files exist:
- `server/.env` - Backend configuration
- `.env.local` - Frontend configuration

## Project Structure

\`\`\`
learning-platform/
├── app/                    # Next.js frontend
├── components/             # React components
├── lib/                    # Utilities and API
├── server/                 # Express.js backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   └── scripts/           # Database scripts
├── start-frontend.bat     # Windows frontend script
├── start-backend.bat      # Windows backend script
├── start-frontend.sh      # Unix frontend script
├── start-backend.sh       # Unix backend script
└── package.json           # Frontend dependencies
\`\`\`

## Next Steps

1. Start both servers using the scripts above
2. Visit http://localhost:3000
3. Register a new account or use demo credentials
4. Explore the course catalog and enroll in courses
5. Test the learning interface with interactive content

## Support

If you encounter any issues:
1. Check that both servers are running
2. Verify environment variables are set correctly
3. Ensure MongoDB is accessible
4. Check the console for error messages
