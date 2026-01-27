# Accord Survey - Quick Start Guide

## 5-Minute Setup

### Step 1: Start MongoDB
```bash
# Option A: Local MongoDB
mongod

# Option B: MongoDB Atlas (Cloud)
# Just get your connection string ready
```

### Step 2: Start Backend
```bash
cd server
npm install
npm run dev
# Backend runs on http://localhost:5000
```

### Step 3: Start Frontend
```bash
# In a new terminal
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

## Using the System

### 1. Create Your First Survey (5 mins)

1. Open **Admin Dashboard**: http://localhost:3000/admin
2. Go to **Employees** → Click **Add Employee**
   - Add: John (Manager), Sarah (Developer), Mike (Designer)
3. Go to **Review Cycles** → Click **Create Cycle**
   - Name: "Q1 2024 Review"
   - Start Date: Today
   - End Date: 7 days from now
4. Click employees to add them to the cycle

### 2. Share Survey with Team

1. Go to **Review Cycles** → Find your cycle
2. Share this link with your team:
   ```
   http://localhost:3000/survey?cycleId=<PASTE_CYCLE_ID>
   ```

### 3. Team Votes

1. Click the link (or open in private browsing to simulate different devices)
2. Rate each team member (1-5 scale)
3. Add optional comments
4. Submit

### 4. View Results

1. Go to **Results** tab
2. Select your review cycle
3. See ratings, averages, and feedback

## Key Features

### One Vote Per Device
- Uses device fingerprinting (FingerprintJS)
- Unique constraint in database: `(reviewCycleId, deviceHash)`
- Server-side validation with SHA-256 hashing
- Cannot vote twice on same device/cycle

### Anonymous & Private
- No names, emails, or IPs collected
- Device ID is hashed before storage
- Only hashes stored in database
- Privacy notice shown to users

### Mobile-Optimized
- Responsive design for phones & tablets
- Touch-friendly buttons and forms
- Progress bar during survey
- Fast feedback submission

## Development Tips

### Testing Device Fingerprinting
1. Open http://localhost:3000/survey?cycleId=<ID> normally
2. Submit a vote (see success)
3. Refresh page (see "Already Submitted")
4. Open in private/incognito window (different device ID, can vote again)

### Viewing Raw Data
```bash
# SSH into MongoDB
mongosh

# Commands
use accord-survey
db.reviewcycles.find()
db.employees.find()
db.votes.find()
```

### Customizing the Theme

Edit `/app/globals.css`:
```css
:root {
  --primary: #0089f4;      /* Main brand color (blue) */
  --accent: #ed1c24;       /* Accent color (red) */
  --foreground: #000000;   /* Text color */
  --background: #ffffff;   /* Background color */
}
```

## API Testing

### Check if Device Voted
```bash
curl "http://localhost:5000/api/votes/check/<CYCLE_ID>/<DEVICE_ID>"
```

### Submit a Vote
```bash
curl -X POST http://localhost:5000/api/votes \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "abc123",
    "reviewCycleId": "<CYCLE_ID>",
    "targetEmployeeId": "<EMPLOYEE_ID>",
    "score": 5,
    "comment": "Great work!"
  }'
```

### Get Results
```bash
curl "http://localhost:5000/api/votes/cycle/<CYCLE_ID>"
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Cannot connect to MongoDB | Check mongod is running, verify URI in `/server/.env` |
| CORS errors | Ensure `CORS_ORIGIN` matches frontend URL (default: http://localhost:3000) |
| Device says already voted | Use private/incognito window, or wait 24hrs |
| Survey link doesn't work | Check cycleId in URL matches database |
| Employees not showing | Make sure cycle is after creation date |

## Next Steps

1. **Customize**: Update colors and branding in `/app/globals.css`
2. **Deploy**: Follow deployment guide in SETUP.md
3. **Secure**: Set proper environment variables for production
4. **Integrate**: Add your actual MongoDB Atlas connection
5. **Monitor**: Check results and export data as needed

## File Structure Quick Reference

```
Key Files to Edit:
- /app/globals.css       - Theme colors and design
- /server/.env           - Backend configuration
- /.env.local            - Frontend API URL
- /SETUP.md              - Full setup guide
```

## Support Commands

```bash
# Check if frontend is running
curl http://localhost:3000

# Check if backend is running
curl http://localhost:5000/api/health

# Test database connection
mongosh <connection_string>
```

Happy surveying!
