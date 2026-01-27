# Accord Survey API Documentation

## Overview
The Accord Survey API is a Node.js/Express backend that manages anonymous team feedback collection with device fingerprinting to enforce one vote per device per review cycle.

## Base URL
```
http://localhost:5000/api
```

## Environment Variables
```bash
MONGODB_URI=mongodb://localhost:27017/accord-survey
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

## API Endpoints

### Review Cycles

#### GET /review-cycles
Retrieve all review cycles with populated employee data.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "ObjectId",
      "name": "Q4 2024 Reviews",
      "description": "Annual team review",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.000Z",
      "isActive": true,
      "employees": [...],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /review-cycles
Create a new review cycle.

**Request Body:**
```json
{
  "name": "Q4 2024 Reviews",
  "description": "Annual team review",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-31T23:59:59.000Z",
  "employees": ["emp_id_1", "emp_id_2"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review cycle created successfully",
  "data": { ... }
}
```

#### GET /review-cycles/:id
Retrieve a specific review cycle by ID.

#### PUT /review-cycles/:id
Update a review cycle.

#### DELETE /review-cycles/:id
Delete a review cycle.

---

### Employees

#### GET /employees
Retrieve all employees.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "ObjectId",
      "name": "John Doe",
      "role": "Software Engineer",
      "department": "Engineering",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /employees
Create a new employee.

**Request Body:**
```json
{
  "name": "John Doe",
  "role": "Software Engineer",
  "department": "Engineering"
}
```

#### GET /employees/:id
Retrieve a specific employee.

#### PUT /employees/:id
Update an employee.

#### DELETE /employees/:id
Delete an employee.

---

### Votes

#### POST /votes
Submit a vote (anonymous feedback).

**Request Body:**
```json
{
  "deviceId": "fingerprint_hash",
  "reviewCycleId": "cycle_id",
  "targetEmployeeId": "employee_id",
  "score": 4,
  "comment": "Great work on the project"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vote submitted successfully",
  "data": { ... }
}
```

**Error Responses:**
- `400` - Missing required fields or invalid score
- `409` - Device has already voted in this review cycle (UNIQUE constraint)
- `400` - Invalid device ID format

#### GET /votes/check/:reviewCycleId/:deviceId
Check if a device has already voted in a review cycle.

**Response:**
```json
{
  "success": true,
  "hasVoted": false
}
```

#### GET /votes/cycle/:reviewCycleId
Get all votes for a specific review cycle with statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "votes": [...],
    "stats": {
      "totalVotes": 10,
      "averageScore": "4.2",
      "byEmployee": {
        "emp_id": {
          "employee": {...},
          "votes": [...],
          "averageScore": "4.5"
        }
      }
    }
  }
}
```

#### GET /votes/employee/:targetEmployeeId
Get all votes for a specific employee with statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "votes": [...],
    "stats": {
      "totalVotes": 5,
      "averageScore": "4.3",
      "scoreDistribution": {
        "1": 0,
        "2": 0,
        "3": 1,
        "4": 2,
        "5": 2
      }
    }
  }
}
```

---

## Device Fingerprinting

### How It Works
1. **Client-Side**: FingerprintJS generates a unique visitor ID based on browser/device characteristics
2. **Server-Side**: Device ID + Review Cycle ID are hashed using SHA-256
3. **Database**: UNIQUE constraint on (reviewCycleId, deviceHash) prevents duplicate votes

### Device Hashing (Server)
```javascript
const hashDevice = (deviceId, reviewCycleId) => {
  return crypto
    .createHash('sha256')
    .update(`${deviceId}:${reviewCycleId}`)
    .digest('hex');
};
```

### Privacy
- Device fingerprints are hashed before storage
- Raw device IDs are never persisted
- No personal data is collected
- One vote per device per review cycle is enforced at the database level

---

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common error codes:
- `400` - Bad Request (validation error)
- `404` - Not Found
- `409` - Conflict (duplicate vote)
- `500` - Server Error

---

## Database Schema

### ReviewCycle
```javascript
{
  name: String (required),
  description: String,
  startDate: Date (required),
  endDate: Date (required),
  isActive: Boolean (default: true),
  employees: [ObjectId] (refs Employee),
  timestamps: true
}
```

### Employee
```javascript
{
  name: String (required),
  role: String (required),
  department: String,
  timestamps: true
}
```

### Vote
```javascript
{
  reviewCycleId: ObjectId (required, ref ReviewCycle),
  targetEmployeeId: ObjectId (required, ref Employee),
  deviceHash: String (required),
  score: Number (1-5, required),
  comment: String,
  timestamps: true,
  UNIQUE: (reviewCycleId, deviceHash)
}
```

---

## Setup & Installation

1. Install dependencies:
```bash
cd server
npm install
```

2. Create `.env` file:
```bash
MONGODB_URI=mongodb://localhost:27017/accord-survey
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

3. Start the server:
```bash
npm run dev  # Development with nodemon
npm start   # Production
```

4. Verify it's running:
```bash
curl http://localhost:5000/api/health
```

---

## CORS Configuration

The API is configured to accept requests from:
- Default: `http://localhost:3000`
- Configurable via `CORS_ORIGIN` environment variable

---

## Rate Limiting

Currently not implemented. Consider adding in production:
- Limit votes per IP
- Limit API calls per endpoint
- Implement Redis-based rate limiting

---

## Security Notes

1. **Device Fingerprinting**: Best-effort anonymity (not cryptographically secure)
2. **Database Constraints**: Primary enforcement of one-vote-per-device
3. **Input Validation**: All inputs validated on server-side
4. **CORS**: Configured to prevent unauthorized cross-origin requests
5. **MongoDB**: Use authentication in production

---

## Testing

Example cURL requests:

```bash
# Create review cycle
curl -X POST http://localhost:5000/api/review-cycles \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","startDate":"2024-01-01","endDate":"2024-01-31"}'

# Create employee
curl -X POST http://localhost:5000/api/employees \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","role":"Engineer"}'

# Submit vote
curl -X POST http://localhost:5000/api/votes \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"test123","reviewCycleId":"xxx","targetEmployeeId":"yyy","score":4}'

# Check if voted
curl http://localhost:5000/api/votes/check/cycle_id/device_id
```

---

## Support

For issues or questions about the API, refer to the main project README or SETUP.md file.
