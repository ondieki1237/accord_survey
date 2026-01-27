# Accord Survey - Setup Guide

## Overview

Accord Survey is a professional anonymous feedback platform for team reviews. It uses device fingerprinting to enforce one vote per device per review cycle while maintaining complete anonymity.

## Architecture

### Frontend (Next.js 16)
- **Admin Dashboard**: Manage review cycles, employees, and view results
- **Voting Interface**: Anonymous survey for team members with device fingerprinting
- **Design**: Mobile-first, responsive UI with Accord branding (#0089f4 blue, #ed1c24 red)

### Backend (Node.js + Express)
- RESTful API for managing review cycles, employees, and votes
- MongoDB for data persistence
- Device fingerprint hashing (SHA-256) with unique constraints

### Key Features
- One vote per device per review cycle (enforced at database level)
- Anonymous voting with privacy-preserving device fingerprinting
- Admin panel for managing review cycles and employees
- Results dashboard with analytics and feedback
- Mobile-optimized survey form

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

## Installation

### 1. Frontend Setup

```bash
# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Update API endpoint if needed
# NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update MongoDB URI and other settings as needed
```

## Running the Application

### Development Mode

**Terminal 1 - Frontend:**
```bash
npm run dev
# Frontend runs on http://localhost:3000
```

**Terminal 2 - Backend:**
```bash
cd server
npm run dev
# Backend runs on http://localhost:5000
```

### Production Mode

**Frontend:**
```bash
npm run build
npm start
```

**Backend:**
```bash
cd server
npm start
```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/accord-survey
PORT=5000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

## Project Structure

```
├── app/
│   ├── admin/                    # Admin dashboard
│   │   ├── page.tsx             # Dashboard home
│   │   ├── review-cycles/       # Review cycle management
│   │   ├── employees/           # Employee management
│   │   ├── results/             # Results/analytics
│   │   └── components/          # Shared admin components
│   ├── survey/                  # Voting interface
│   │   ├── page.tsx            # Survey entry
│   │   ├── SurveyContent.tsx   # Survey logic
│   │   └── SurveyForm.tsx      # Survey form with ratings
│   ├── page.tsx                # Landing page
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
├── lib/
│   └── deviceFingerprint.ts    # Device fingerprinting utility
├── components/                  # Shared components
│   └── ui/                     # shadcn/ui components
├── server/                      # Backend (Node.js + Express)
│   ├── index.js                # Server entry point
│   ├── models/                 # MongoDB models
│   │   ├── ReviewCycle.js
│   │   ├── Employee.js
│   │   └── Vote.js
│   ├── routes/                 # API routes
│   │   ├── reviewCycles.js
│   │   ├── employees.js
│   │   └── votes.js
│   ├── middleware/             # Express middleware
│   │   └── errorHandler.js
│   └── utils/                  # Utility functions
│       └── fingerprint.js      # Device fingerprinting
└── public/                      # Static assets
```

## API Endpoints

### Review Cycles
- `GET /api/review-cycles` - Get all cycles
- `GET /api/review-cycles/:id` - Get single cycle
- `POST /api/review-cycles` - Create cycle
- `PUT /api/review-cycles/:id` - Update cycle
- `DELETE /api/review-cycles/:id` - Delete cycle
- `POST /api/review-cycles/:id/employees` - Add employee to cycle
- `DELETE /api/review-cycles/:id/employees/:employeeId` - Remove employee

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get single employee
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Votes
- `GET /api/votes/check/:reviewCycleId/:deviceId` - Check if device has voted
- `POST /api/votes` - Submit vote
- `GET /api/votes/cycle/:reviewCycleId` - Get cycle results (admin)
- `GET /api/votes/employee/:targetEmployeeId` - Get employee stats

## Device Fingerprinting

The system uses FingerprintJS to generate unique device identifiers:

1. **Client-side**: FingerprintJS generates a visitor ID from browser/device properties
2. **Server-side**: Device ID is hashed with review cycle ID using SHA-256
3. **Database**: UNIQUE constraint enforces one vote per device per cycle

### Privacy
- No personal data is collected
- Device fingerprint is hashed before storage
- Raw device IDs are never logged
- Users are informed via privacy notice

## Admin Dashboard Features

### Review Cycles Management
- Create new review cycles with custom date ranges
- Edit cycle details and time spans
- Assign employees to cycles
- View cycle status (active/closed)

### Employee Management
- Add team members with names, roles, departments
- Edit employee details
- Delete employees
- Assign to multiple review cycles

### Results & Analytics
- View real-time feedback and ratings
- See average scores per employee
- Read anonymous comments
- Filter by review cycle

## Voting Interface

### Survey Flow
1. User visits survey link with cycle ID
2. Device fingerprint is generated
3. System checks if device already voted
4. If new: User rates each employee (1-5 scale)
5. Optional: User can leave comments
6. Submit all feedback at once
7. Success message with privacy assurance

### Scoring
- **5 - Excellent**: Exceeds expectations
- **4 - Good**: Meets expectations
- **3 - Fair**: Satisfactory performance
- **2 - Needs Improvement**: Below expectations
- **1 - Poor**: Significantly below expectations

## Database Schema

### ReviewCycle
```
{
  _id: ObjectId,
  name: String,
  description: String,
  startDate: Date,
  endDate: Date,
  isActive: Boolean,
  employees: [ObjectId], // refs to Employee
  createdAt: Date,
  updatedAt: Date
}
```

### Employee
```
{
  _id: ObjectId,
  name: String,
  role: String,
  department: String,
  reviewCycles: [ObjectId], // refs to ReviewCycle
  createdAt: Date,
  updatedAt: Date
}
```

### Vote
```
{
  _id: ObjectId,
  reviewCycleId: ObjectId, // ref to ReviewCycle
  targetEmployeeId: ObjectId, // ref to Employee
  deviceHash: String, // SHA-256(deviceId:cycleId)
  score: Number, // 1-5
  comment: String,
  createdAt: Date,
  updatedAt: Date
}

// UNIQUE INDEX on (reviewCycleId, deviceHash)
```

## Security Considerations

1. **Device Fingerprinting**: One vote per device enforced at DB level
2. **Hashing**: Device IDs are hashed with SHA-256 before storage
3. **Privacy**: No personal identifiable information is collected
4. **CORS**: Backend restricts requests to frontend origin
5. **Validation**: Input validation on all endpoints
6. **Error Handling**: Safe error messages (no SQL injection exposure)

## Troubleshooting

### "Failed to connect to MongoDB"
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- For MongoDB Atlas, verify IP whitelist

### "API request failed"
- Check NEXT_PUBLIC_API_BASE_URL is correct
- Ensure backend server is running
- Check browser console for CORS errors
- Verify backend is listening on correct port

### "Vote already submitted"
- Device fingerprint detected previous vote
- This is expected behavior
- Clear browser data to test with fresh fingerprint

## Deployment

### Frontend (Vercel)
```bash
# Push to GitHub
git push origin main

# Deploy via Vercel dashboard
# Set environment variables:
# NEXT_PUBLIC_API_BASE_URL=https://your-backend-url/api
```

### Backend (Heroku, Railway, Render)
1. Push to GitHub
2. Deploy via platform UI
3. Set environment variables:
   - MONGODB_URI
   - CORS_ORIGIN
   - NODE_ENV=production

## Support

For issues or questions, please check:
1. Review cycle dates are correct
2. Employees are added to cycles
3. Backend is running and accessible
4. MongoDB is connected
5. Environment variables are set

## License

MIT
