# Accord Survey

> **Anonymous Team Feedback Platform**  
> One device, one vote. Fair. Secure. Transparent.

[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)]()
[![License](https://img.shields.io/badge/License-MIT-blue)]()
[![Version](https://img.shields.io/badge/Version-1.0.0-blue)]()

## 🎯 Overview

Accord Survey is a professional-grade platform for collecting anonymous, device-verified team feedback. Admins create review cycles, invite employees, and share anonymous survey links. Team members provide honest feedback knowing their device can only submit once per cycle, preventing vote manipulation while maintaining complete anonymity.

**Perfect for:**
- Team performance reviews
- 360-degree feedback
- Peer evaluations
- Anonymous surveys
- Team retrospectives

## ✨ Key Features

### 🔐 Anonymous Voting
- Device fingerprinting prevents duplicate submissions
- No personal data collection
- Complete voter anonymity
- One vote per device per review cycle

### 📊 Admin Dashboard
- Create and manage review cycles (with custom date ranges)
- Add and organize team members (with roles/departments)
- Generate shareable survey links
- View real-time results and analytics
- Export feedback data

### 📱 Mobile-First Design
- Responsive on all devices
- Touch-friendly interface
- Fast load times
- Works in any modern browser

### 🛡️ Security & Privacy
- Device fingerprints hashed twice (client + server)
- Database UNIQUE constraints prevent duplicates
- Raw device IDs never stored
- CORS protection for API
- Privacy notice for transparency

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or cloud)
- Modern web browser

### 1. Clone & Install
```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Copy environment files
cp server/.env.example server/.env
```

### 2. Configure MongoDB
```bash
# Option A: Local MongoDB
brew services start mongodb-community

# Option B: Cloud (MongoDB Atlas)
# Update MONGODB_URI in server/.env
```

### 3. Set Environment Variables

**server/.env:**
```
MONGODB_URI=mongodb://localhost:27017/accord-survey
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

**Create .env.local in root:**
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

### 4. Start Both Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 5. Access the Application
- Admin Dashboard: `http://localhost:3000`
- API Health: `http://localhost:5000/api/health`

## 📚 Complete Documentation

| Guide | Purpose |
|-------|---------|
| **[QUICKSTART.md](/QUICKSTART.md)** | Get running in 5 minutes |
| **[PROJECT_SUMMARY.md](/PROJECT_SUMMARY.md)** | Complete architecture & overview |
| **[BACKEND_SETUP.md](/BACKEND_SETUP.md)** | Backend setup & API integration |
| **[server/API_DOCS.md](/server/API_DOCS.md)** | REST API endpoint reference |
| **[TESTING.md](/TESTING.md)** | Integration testing procedures |

## 🏗️ Architecture

### Frontend Stack
```
Next.js 16 → React 19 → Tailwind CSS + Shadcn/ui
├── Admin Dashboard (review cycles, employees, results)
├── Public Survey Interface (anonymous feedback form)
└── Device Fingerprinting (FingerprintJS)
```

### Backend Stack
```
Express.js → MongoDB + Mongoose
├── RESTful API routes
├── Device fingerprint hashing (SHA-256)
├── Database UNIQUE constraints
└── Comprehensive error handling
```

### Device Fingerprinting
```
1. Client: FingerprintJS generates visitor ID
2. Server: Hash visitor ID + cycle ID with SHA-256
3. Database: UNIQUE constraint prevents duplicates
```

## 📋 How It Works

### For Admins
```
1. Go to http://localhost:3000 → Auto-redirects to /admin
2. Create a Review Cycle (name, dates, status)
3. Add Team Members (name, role, department)
4. Assign employees to the cycle
5. Click "Share" → Get public survey link
6. Send link to team
7. View results in real-time as feedback arrives
```

### For Employees (Voters)
```
1. Receive anonymous survey link
2. Click link → Survey loads (no login)
3. Rate each team member (1-5 scale)
4. Add optional comments
5. Submit feedback
6. See success message
7. Cannot vote again from same device
```

## 🔑 Key Endpoints

### Review Cycles Management
```bash
POST   /api/review-cycles              # Create cycle
GET    /api/review-cycles              # List cycles
GET    /api/review-cycles/:id          # Get specific cycle
PUT    /api/review-cycles/:id          # Update cycle
DELETE /api/review-cycles/:id          # Delete cycle
```

### Employees Management
```bash
POST   /api/employees                  # Add employee
GET    /api/employees                  # List employees
GET    /api/employees/:id              # Get employee
PUT    /api/employees/:id              # Update employee
DELETE /api/employees/:id              # Delete employee
```

### Vote Submission & Analytics
```bash
POST   /api/votes                      # Submit vote
GET    /api/votes/check/:cycleId/:deviceId  # Check if voted
GET    /api/votes/cycle/:cycleId       # Get cycle results
GET    /api/votes/employee/:employeeId # Get employee feedback
```

## 🎨 Design System

### Colors
- **Primary**: #0089f4 (Professional Blue)
- **Accent**: #ed1c24 (Bold Red)
- **Neutrals**: Black, White, Grays

### Typography
- **Headings**: Geist Sans (bold)
- **Body**: Geist Sans (regular)
- **Code**: Geist Mono

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🔒 Security Features

### Anonymity
✅ No account creation  
✅ No email/identity collection  
✅ Device fingerprint hashed twice  
✅ Raw device ID never stored  

### Duplicate Prevention
✅ FingerprintJS client-side  
✅ SHA-256 server-side hashing  
✅ Database UNIQUE constraint  
✅ 409 error on duplicate attempts  

### Data Protection
✅ CORS configuration  
✅ Input validation  
✅ Error message sanitization  
✅ MongoDB schema validation  

## 📊 Example Workflow

### Scenario: Q1 Review Cycle

**Admin:**
1. Creates cycle: "Q1 2025 Team Reviews"
2. Adds 5 employees: John, Alice, Bob, Carol, David
3. Clicks Share → Gets link
4. Sends link to entire team via email

**Employee 1 (Desktop):**
1. Opens link in Chrome
2. Rates all 5 employees
3. Adds comments for 2 people
4. Submits feedback
5. Sees success message

**Employee 2 (Tablet):**
1. Opens link in Safari (different device)
2. Rates all 5 employees
3. Submits feedback successfully

**Employee 3 (Tried to vote twice):**
1. Opens link from same Chrome browser as Employee 1
2. Sees "Already Submitted" message
3. Cannot vote again from same device

**Admin (Next Day):**
1. Goes to Results page
2. Sees:
   - 3 total votes submitted
   - Average score per employee
   - All comments (anonymous)
   - Score distribution charts

## 🧪 Testing

### Quick Test
```bash
# Backend health
curl http://localhost:5000/api/health

# Create test employee
curl -X POST http://localhost:5000/api/employees \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","role":"Engineer","department":"Tech"}'
```

**For comprehensive testing, see [TESTING.md](/TESTING.md)**

## 📦 Project Structure

```
accord-survey/
├── server/                    # Node.js/Express backend
│   ├── index.js              # Express app setup
│   ├── package.json          # Backend dependencies
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API endpoints
│   ├── utils/                # Helper functions
│   └── API_DOCS.md          # API documentation
├── app/                      # Next.js frontend
│   ├── page.tsx             # Home (redirects to /admin)
│   ├── admin/               # Admin dashboard
│   └── survey/              # Public survey
├── lib/                      # Frontend utilities
├── components/               # Shadcn/ui components
└── Documentation files
```

## 🚀 Deployment

### Backend Deployment (Railway, Render, Heroku)
```bash
# Set environment variables
MONGODB_URI=<production-mongodb-url>
CORS_ORIGIN=<production-frontend-url>

# Deploy
npm install && npm start
```

### Frontend Deployment (Vercel)
```bash
# Set environment variable
NEXT_PUBLIC_API_BASE_URL=<production-backend-url>

# Deploy via Vercel dashboard or CLI
npm run build
```

**See [BACKEND_SETUP.md](/BACKEND_SETUP.md) for detailed deployment guide**

## 📖 API Response Examples

### Create Review Cycle
```bash
curl -X POST http://localhost:5000/api/review-cycles \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Q1 2025 Reviews",
    "description": "Team performance feedback",
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": "2025-03-31T23:59:59Z"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Review cycle created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Q1 2025 Reviews",
    "employees": [],
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### Submit Vote
```bash
curl -X POST http://localhost:5000/api/votes \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "a1b2c3d4e5f6g7h8",
    "reviewCycleId": "507f1f77bcf86cd799439011",
    "targetEmployeeId": "507f1f77bcf86cd799439012",
    "score": 4,
    "comment": "Great work on the project!"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Vote submitted successfully",
  "data": { ... }
}
```

### Duplicate Vote Error
```json
{
  "success": false,
  "message": "You have already submitted a vote for this review cycle"
}
```

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: ECONNREFUSED
→ Ensure MongoDB is running
→ Check MONGODB_URI in .env
```

### CORS Error
```
Access to XMLHttpRequest blocked
→ Verify CORS_ORIGIN matches frontend URL
→ Check NEXT_PUBLIC_API_BASE_URL
```

### Survey Not Loading
```
Failed to load survey
→ Check backend is running
→ Verify cycle ID is valid
→ Check browser console for errors
```

### Cannot Vote Twice (Expected)
```
Already Submitted
→ This is correct behavior!
→ One device = one vote per cycle
→ Try different browser/device to test
```

## 📞 Support

- **Setup Issues**: See [BACKEND_SETUP.md](/BACKEND_SETUP.md)
- **API Questions**: See [server/API_DOCS.md](/server/API_DOCS.md)
- **Testing Help**: See [TESTING.md](/TESTING.md)
- **Overview**: See [PROJECT_SUMMARY.md](/PROJECT_SUMMARY.md)

## 📋 Requirements

### Runtime
- Node.js 18+
- npm or yarn

### Databases
- MongoDB 4.4+ (local or Atlas)

### Browsers
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## 📝 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org) - React framework
- [Express.js](https://expressjs.com) - Web framework
- [MongoDB](https://www.mongodb.com) - Database
- [Shadcn/ui](https://ui.shadcn.com) - Component library
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [FingerprintJS](https://fingerprintjs.com) - Device fingerprinting
- [Recharts](https://recharts.org) - Data visualization

## 🎯 Success Checklist

Your setup is complete when you can:

- [ ] Start backend: `npm run dev` (in server/)
- [ ] Start frontend: `npm run dev` (in root)
- [ ] Access admin: `http://localhost:3000` (redirects from home)
- [ ] Create review cycle
- [ ] Add employees
- [ ] Generate share link
- [ ] Complete anonymous survey
- [ ] Prevent duplicate votes
- [ ] View results with statistics
- [ ] See comments from voters

## 🚀 Ready to Launch?

```bash
# 1. Backend
cd server && npm run dev

# 2. Frontend (new terminal)
npm run dev

# 3. Open browser
open http://localhost:3000

# 4. Start creating review cycles!
```

---

**Accord Survey** - Making team feedback honest, fair, and anonymous.

[Read the full documentation →](/PROJECT_SUMMARY.md)
# accord_survey
