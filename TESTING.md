# Accord Survey - Integration Testing Guide

## Quick Start Testing

### Prerequisites
- Backend running on `http://localhost:5000/api`
- Frontend running on `http://localhost:3000`
- MongoDB connected and running

## Test Workflow

### Step 1: Admin Dashboard Access

1. Open `http://localhost:3000`
2. Should automatically redirect to `/admin`
3. Verify dashboard loads with three sections:
   - Review Cycles (empty initially)
   - Employees (empty initially)
   - Results (empty initially)

### Step 2: Create Employees

1. Click "Employees" in sidebar
2. Click "Add Employee" button
3. Fill in details:
   - **Name**: John Smith
   - **Role**: Senior Developer
   - **Department**: Engineering
4. Click "Save"
5. Verify employee appears in table
6. Repeat for 3-4 more employees with different roles

**Employees to create:**
- Alice Johnson (Product Manager)
- Bob Wilson (UX Designer)
- Carol Davis (QA Engineer)
- David Lee (DevOps Engineer)

### Step 3: Create Review Cycle

1. Click "Review Cycles" in sidebar
2. Click "Create Cycle" button
3. Fill in details:
   - **Cycle Name**: Q1 2025 Reviews
   - **Description**: Team performance feedback
   - **Start Date**: Today
   - **End Date**: 30 days from now
4. Click "Next Step"
5. Select all employees you created
6. Click "Create"
7. Verify cycle appears in table with employee count

### Step 4: Generate Survey Link

1. In Review Cycles table, click "Share" button on your cycle
2. A dialog opens with survey URL
3. Copy the link:
   - Example: `http://localhost:3000/survey?cycleId=507f1f77bcf86cd799439011`
4. The dialog shows instructions on how to share

### Step 5: Test Anonymous Survey (Desktop)

1. Open copied link in **same browser** (but different tab)
2. Should see:
   - "Accord Survey" header
   - Privacy notice about device fingerprint
   - Survey cycle name and description
   - Loading spinner → transitions to form

3. You should see an error: **"Already Submitted"** because:
   - Same device (browser) has already "voted" in this cycle
   - This is expected behavior - testing the one-vote-per-device enforcement

### Step 6: Test Anonymous Survey (Different Device)

1. Open survey link in **different browser** or **incognito window**
2. Should see the survey form
3. Fill out feedback:
   - **Rate each employee** 1-5 scale
   - **Add optional comments** for at least one
   - Click "Next" to move between employees
   - Click "Previous" to go back
4. After final employee, click "Submit All Feedback"
5. Should see success screen: **"Thank You!"**
6. Message: "This device cannot submit another vote for this review cycle"
7. Click "Return Home" button

### Step 7: Verify Vote Enforcement

1. Try to reload survey link from **incognito window**
2. Should see: **"Already Submitted"** message
3. This proves one-vote-per-device enforcement works ✅

### Step 8: View Results

1. Go back to admin: `http://localhost:3000/admin`
2. Click "Results" tab
3. You should see:
   - Select the review cycle from dropdown
   - Employee cards showing:
     - Employee name
     - Average score
     - Number of votes received
     - Score distribution chart (1-5)
   - Vote comments (if any)

4. Click on individual employee to see detailed feedback:
   - All comments received
   - Score breakdown
   - Average rating

## API-Level Testing (with cURL)

### Test 1: Health Check
```bash
curl http://localhost:5000/api/health
```
Expected: `{"success": true, "message": "Accord Survey API is running"}`

### Test 2: Create Employee
```bash
curl -X POST http://localhost:5000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "role": "Engineer",
    "department": "Tech"
  }'
```

### Test 3: Get All Employees
```bash
curl http://localhost:5000/api/employees
```

### Test 4: Create Review Cycle
```bash
curl -X POST http://localhost:5000/api/review-cycles \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Cycle",
    "description": "Testing",
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": "2025-02-01T00:00:00Z",
    "employees": ["EMPLOYEE_ID_HERE"]
  }'
```
Replace `EMPLOYEE_ID_HERE` with actual employee ID from Test 2.

### Test 5: Check if Device Voted
```bash
curl http://localhost:5000/api/votes/check/CYCLE_ID/test-device-id
```
Expected (first time): `{"success": true, "hasVoted": false}`

### Test 6: Submit Vote
```bash
curl -X POST http://localhost:5000/api/votes \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-device-id",
    "reviewCycleId": "CYCLE_ID",
    "targetEmployeeId": "EMPLOYEE_ID",
    "score": 4,
    "comment": "Great work!"
  }'
```
Expected: `{"success": true, "message": "Vote submitted successfully", "data": {...}}`

### Test 7: Check if Device Voted Again (Duplicate Prevention)
```bash
curl http://localhost:5000/api/votes/check/CYCLE_ID/test-device-id
```
Expected: `{"success": true, "hasVoted": true}`

### Test 8: Try to Submit Duplicate Vote
```bash
curl -X POST http://localhost:5000/api/votes \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-device-id",
    "reviewCycleId": "CYCLE_ID",
    "targetEmployeeId": "EMPLOYEE_ID",
    "score": 5,
    "comment": "Updated feedback"
  }'
```
Expected error (409): `{"success": false, "message": "You have already submitted a vote for this review cycle"}`

### Test 9: Get Votes for Cycle
```bash
curl http://localhost:5000/api/votes/cycle/CYCLE_ID
```
Expected: Returns all votes with statistics

### Test 10: Get Votes for Employee
```bash
curl http://localhost:5000/api/votes/employee/EMPLOYEE_ID
```
Expected: Returns feedback for that employee with score distribution

## Security & Privacy Verification

### Device Fingerprinting
- [ ] Different browsers = different device IDs
- [ ] Same browser = same device ID
- [ ] Incognito/Private = same device (browser fingerprint based)
- [ ] Different device = different device ID

### One-Vote-Per-Device
- [ ] First vote succeeds
- [ ] Second vote from same device fails
- [ ] Different device can vote
- [ ] Database UNIQUE constraint prevents duplicates

### Anonymous Feedback
- [ ] No personal data collected
- [ ] Comments are stored anonymously
- [ ] No way to trace voter identity
- [ ] Only device hash stored, not device ID

### Privacy Notice
- [ ] Survey displays privacy notice on load
- [ ] Explains anonymous device fingerprint usage
- [ ] Confirms no personal data collected

## Error Scenario Testing

### Missing Required Fields
```bash
curl -X POST http://localhost:5000/api/votes \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "test"}'
```
Expected (400): Missing field error message

### Invalid Score (not 1-5)
```bash
curl -X POST http://localhost:5000/api/votes \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-id",
    "reviewCycleId": "CYCLE_ID",
    "targetEmployeeId": "EMP_ID",
    "score": 10
  }'
```
Expected (400): "Score must be an integer between 1 and 5"

### Expired Review Cycle
1. Create cycle with end date = yesterday
2. Try to access survey link
3. Should see: "This survey has ended"

### Non-existent Cycle
1. Open: `http://localhost:3000/survey?cycleId=000000000000000000000000`
2. Should see: "Survey not found"

## Performance Testing

### Load Testing Scenario
1. Create review cycle with 20 employees
2. Open survey in multiple browser windows
3. Each submits all 20 votes
4. Verify all submissions complete successfully
5. Check results page loads and calculates stats

### Timing
- Survey load: < 2 seconds
- Vote submission: < 1 second
- Results page: < 1 second

## Browser Compatibility

Test on:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

All should:
- Load survey correctly
- Submit votes successfully
- Show success confirmation
- Prevent duplicate votes

## Mobile Testing

### Desktop View
- [ ] Form displays correctly
- [ ] Rating options are clickable
- [ ] Navigation buttons work

### Mobile View (< 768px)
- [ ] Form is responsive
- [ ] Rating options stack vertically
- [ ] Buttons are touch-friendly (44px min height)
- [ ] Text is readable (no overflow)
- [ ] No horizontal scrolling needed

## Final Verification Checklist

### Backend
- [ ] Server starts without errors
- [ ] MongoDB connection successful
- [ ] All API endpoints accessible
- [ ] Device fingerprinting working
- [ ] UNIQUE constraint prevents duplicates
- [ ] Error handling comprehensive

### Frontend
- [ ] Home page redirects to admin
- [ ] Admin dashboard loads
- [ ] Can create review cycles
- [ ] Can manage employees
- [ ] Share links are correct
- [ ] Survey form works
- [ ] Anonymous voting works
- [ ] Results display correctly
- [ ] One-vote-per-device enforced
- [ ] Mobile responsive

### Integration
- [ ] Frontend communicates with backend
- [ ] Environment variables correct
- [ ] API responses match expected format
- [ ] Error messages display properly
- [ ] Privacy notice shown
- [ ] Database relationships intact

### Security
- [ ] Device fingerprints hashed
- [ ] No personal data collected
- [ ] CORS properly configured
- [ ] Input validation working
- [ ] Duplicate votes prevented

## Troubleshooting Test Failures

### Survey Not Loading
- Check backend is running
- Verify `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
- Check browser console for errors
- Verify cycle ID in URL is valid

### Votes Not Submitting
- Check network tab for 409 errors
- Verify device can vote (check /votes/check endpoint)
- Check vote payload in network inspector
- Verify all required fields are present

### Results Not Showing
- Verify votes were submitted successfully
- Check API response from /votes/cycle/:cycleId
- Verify employee IDs in vote matches employee data
- Check browser console for calculation errors

### Device Hash Issues
- Clear browser cache/cookies
- Try different browser for different device
- Try incognito window
- Check fingerprint.js is loading from CDN

## Post-Testing Cleanup

After testing, to reset for next round:

```bash
# Delete database (in MongoDB)
use accord-survey
db.dropDatabase()

# Or specific collections
db.reviewcycles.deleteMany({})
db.employees.deleteMany({})
db.votes.deleteMany({})
```

---

**Happy Testing! 🚀**

All tests passing = System ready for production deployment
