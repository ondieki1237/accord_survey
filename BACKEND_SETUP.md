# Accord Survey - Backend Setup & Integration Guide

## Overview
This document outlines how to properly set up and integrate the Node.js/Express backend with the Next.js frontend.

## Project Structure
```
project/
├── server/                      # Node.js/Express backend
│   ├── index.js                # Main server file
│   ├── package.json            # Backend dependencies
│   ├── .env.example            # Environment variables template
│   ├── API_DOCS.md             # API documentation
│   ├── models/
│   │   ├── ReviewCycle.js      # Review cycle model
│   │   ├── Employee.js         # Employee model
│   │   └── Vote.js             # Vote model with device fingerprint
│   ├── routes/
│   │   ├── reviewCycles.js     # Review cycle CRUD + management
│   │   ├── employees.js        # Employee CRUD
│   │   └── votes.js            # Vote submission & statistics
│   ├── middleware/
│   │   └── errorHandler.js     # Global error handling
│   └── utils/
│       └── fingerprint.js      # Device fingerprinting utilities
├── app/                        # Next.js frontend
│   ├── page.tsx               # Home (redirects to /admin)
│   ├── admin/                 # Admin dashboard
│   │   ├── page.tsx          # Dashboard overview
│   │   ├── layout.tsx        # Admin layout
│   │   ├── review-cycles/    # Review cycle management
│   │   ├── employees/        # Employee management
│   │   └── results/          # Results & analytics
│   ├── survey/                # Public survey interface
│   │   ├── page.tsx          # Survey entry point
│   │   ├── SurveyContent.tsx # Survey logic & state
│   │   └── SurveyForm.tsx    # Rating form component
│   └── layout.tsx            # Global layout
├── lib/
│   └── deviceFingerprint.ts  # FingerprintJS integration
├── SETUP.md                   # Frontend setup
└── BACKEND_SETUP.md          # This file
```

## Step-by-Step Backend Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

**Dependencies installed:**
- `express` - Web framework
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variables
- `mongoose` - MongoDB ORM
- `crypto` - Node.js built-in for hashing

### 2. Configure Environment Variables

Create `.env` file in the `server/` directory:

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```
MONGODB_URI=mongodb://localhost:27017/accord-survey
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

**Important Notes:**
- `MONGODB_URI`: MongoDB connection string (local development by default)
- `PORT`: Backend server port (must match NEXT_PUBLIC_API_BASE_URL)
- `CORS_ORIGIN`: Frontend URL (Next.js dev server by default)

### 3. Set Up MongoDB

**Option A: Local MongoDB**
```bash
# macOS with Homebrew
brew services start mongodb-community

# Linux with systemd
sudo systemctl start mongod

# Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/accord-survey
```

### 4. Start the Backend Server

```bash
cd server
npm run dev  # Development with auto-reload
# or
npm start   # Production
```

Expected output:
```
Accord Survey server running on port 5000
MongoDB: mongodb://localhost:27017/accord-survey
CORS Origin: http://localhost:3000
```

### 5. Verify Backend is Running

Test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Accord Survey API is running"
}
```

## Frontend Configuration

### 1. Set Environment Variable

Create `.env.local` in the root project directory:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

**Why `NEXT_PUBLIC_` prefix?**
- Makes the variable accessible in the browser
- Client-side code can access this variable
- Safe for public URLs (not secrets)

### 2. Verify Frontend Connection

The frontend automatically connects to the backend when you:
1. Load `/admin` - fetches review cycles
2. Load `/survey?cycleId=xxx` - fetches survey data
3. Submit a vote - posts to backend API

## Backend Models & Relationships

### ReviewCycle
- Stores review cycle information (name, dates, status)
- Has many Employees (arrays of employee IDs)
- Referenced by Votes

### Employee
- Stores team member information (name, role, department)
- Referenced by ReviewCycle and Vote

### Vote
- Stores anonymous feedback
- Links to ReviewCycle and Employee
- Contains device hash (not raw device ID)
- UNIQUE constraint on (reviewCycleId, deviceHash) prevents duplicates

## API Endpoint Summary

### Review Cycles Management
```
GET    /api/review-cycles              # List all cycles
POST   /api/review-cycles              # Create cycle
GET    /api/review-cycles/:id          # Get specific cycle
PUT    /api/review-cycles/:id          # Update cycle
DELETE /api/review-cycles/:id          # Delete cycle
```

### Employees Management
```
GET    /api/employees                  # List all employees
POST   /api/employees                  # Create employee
GET    /api/employees/:id              # Get specific employee
PUT    /api/employees/:id              # Update employee
DELETE /api/employees/:id              # Delete employee
```

### Vote Submission & Analytics
```
POST   /api/votes                      # Submit vote
GET    /api/votes/check/:cycleId/:deviceId    # Check if voted
GET    /api/votes/cycle/:cycleId       # Get votes for cycle
GET    /api/votes/employee/:employeeId # Get votes for employee
```

## Device Fingerprinting Flow

### 1. Client-Side (lib/deviceFingerprint.ts)
```typescript
// FingerprintJS loads from CDN
// Generates unique visitor ID (already hashed)
const deviceId = await getDeviceFingerprint()
// Returns: "a1b2c3d4e5f6..." (FingerprintJS hash)
```

### 2. Server-Side (server/utils/fingerprint.js)
```javascript
// Hash again: SHA256(deviceId + ":" + cycleId)
const deviceHash = hashDevice(deviceId, cycleId)
// Returns: "x9y8z7w6v5u4..." (server-side SHA256)
```

### 3. Database (server/models/Vote.js)
```javascript
// UNIQUE constraint prevents duplicates
db.votes.createIndex(
  { reviewCycleId: 1, deviceHash: 1 },
  { unique: true }
)
```

## Error Handling

All backend routes include:
- Input validation
- Try-catch blocks
- Error middleware (catches all unhandled errors)
- Consistent error response format

Example error response:
```json
{
  "success": false,
  "message": "You have already submitted a vote for this review cycle"
}
```

## Security Best Practices

### Implemented
✅ Device fingerprinting (best-effort anonymity)
✅ Server-side hashing of device IDs
✅ Database UNIQUE constraint enforcement
✅ CORS configuration
✅ Input validation on all endpoints
✅ Error handling (no sensitive data in responses)

### Recommended for Production
- [ ] Rate limiting (express-rate-limit)
- [ ] MongoDB authentication
- [ ] HTTPS/TLS
- [ ] API keys for admin endpoints
- [ ] Request logging
- [ ] Data encryption at rest
- [ ] Regular backups
- [ ] Monitoring & alerts

## Troubleshooting

### MongoDB Connection Error
**Problem:** `MongoDB connection error: ECONNREFUSED`

**Solution:**
- Ensure MongoDB is running (`brew services list`)
- Check connection string in `.env`
- Verify MongoDB port (default 27017)

### CORS Error
**Problem:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
- Verify `CORS_ORIGIN` in `.env` matches frontend URL
- Check frontend environment variable `NEXT_PUBLIC_API_BASE_URL`
- Ensure backend is running and accessible

### Device Hash Mismatch
**Problem:** `You have already submitted a vote` but device hasn't voted

**Solution:**
- FingerprintJS may generate different hashes across browsers
- Private/Incognito mode changes fingerprint
- Different devices always have different fingerprints
- This is expected behavior

### API Not Accessible
**Problem:** `Failed to fetch from http://localhost:5000/api`

**Solution:**
1. Check backend is running: `npm run dev`
2. Test health endpoint: `curl http://localhost:5000/api/health`
3. Verify port 5000 is not in use
4. Check firewall settings

## Development Workflow

### Terminal 1: Backend
```bash
cd server
npm run dev
# Watches for changes and auto-restarts
```

### Terminal 2: Frontend
```bash
npm run dev
# Frontend dev server on port 3000
```

### Terminal 3: Optional - MongoDB
```bash
# If using local MongoDB
mongod
# or Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Production Deployment

### Backend Deployment (e.g., Railway, Render, Heroku)

1. Set environment variables:
   - `MONGODB_URI` → MongoDB Atlas connection string
   - `PORT` → Platform-assigned port
   - `CORS_ORIGIN` → Production frontend URL

2. Deploy:
   ```bash
   npm install
   npm start
   ```

### Frontend Deployment (Vercel)

1. Set environment variable:
   - `NEXT_PUBLIC_API_BASE_URL` → Production backend URL

2. Deploy via Vercel dashboard or CLI:
   ```bash
   npm run build
   ```

## File Integrity Checklist

Before deployment, verify all backend files exist and are correctly configured:

### Core Files
- [ ] `server/index.js` - Main Express app
- [ ] `server/package.json` - Dependencies defined
- [ ] `server/.env` - Environment variables set
- [ ] `server/API_DOCS.md` - API documentation

### Models (server/models/)
- [ ] `ReviewCycle.js` - Schema with employee relationships
- [ ] `Employee.js` - Schema with basic fields
- [ ] `Vote.js` - Schema with device hash & UNIQUE index

### Routes (server/routes/)
- [ ] `reviewCycles.js` - All CRUD endpoints working
- [ ] `employees.js` - All CRUD endpoints working
- [ ] `votes.js` - Vote submission, check, and statistics

### Utilities
- [ ] `server/utils/fingerprint.js` - hashDevice & isValidDeviceId
- [ ] `server/middleware/errorHandler.js` - Global error handler

### Frontend Integration
- [ ] `lib/deviceFingerprint.ts` - FingerprintJS integration
- [ ] `.env.local` - NEXT_PUBLIC_API_BASE_URL set
- [ ] `app/survey/SurveyContent.tsx` - Uses correct API calls
- [ ] `app/survey/SurveyForm.tsx` - Submits votes correctly
- [ ] `app/admin/review-cycles/ReviewCycleTable.tsx` - Share links working

## Next Steps

1. ✅ Backend setup complete
2. ✅ Frontend environment variables set
3. Run both frontend and backend
4. Test the workflow:
   - Go to /admin
   - Create a review cycle
   - Add employees
   - Click "Share" to get survey link
   - Open survey link in another browser
   - Submit feedback
   - Check results in /admin/results

## Support

- **API Issues**: See `/server/API_DOCS.md`
- **Frontend Issues**: See `/SETUP.md`
- **General Setup**: See this file

---

**Last Updated**: January 2025
**Version**: 1.0.0
