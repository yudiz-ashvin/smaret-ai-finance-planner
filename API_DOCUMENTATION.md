# Smart AI Finance Planner - API Documentation

**Base URL:** `http://localhost:5000/api`

All API endpoints require authentication except for authentication endpoints themselves. Include the JWT token in the Authorization header: `Authorization: Bearer <token>`

---

## Table of Contents

1. [Authentication](#authentication)
2. [User Profile](#user-profile)
3. [Budget](#budget)
4. [Expenses](#expenses)
5. [Bank Statements](#bank-statements)
6. [AI Services](#ai-services)
7. [Insurance](#insurance)
8. [Investments](#investments)

---

## Authentication

### 1. Send OTP

Send OTP to user's mobile number or email.

**Endpoint:** `POST /auth/send-otp`

**Request Body:**
```json
{
  "mobile": "9876543210",
  "email": "user@example.com"
}
```
(At least one of mobile or email is required)

**cURL Request:**
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "9876543210"
  }'
```

**Response:**
```json
{
  "message": "OTP sent successfully",
  "otp": "123456"
}
```
(OTP is only returned in development mode)

---

### 2. Verify OTP

Verify OTP and get authentication token.

**Endpoint:** `POST /auth/verify-otp`

**Request Body:**
```json
{
  "mobile": "9876543210",
  "email": "user@example.com",
  "otp": "123456"
}
```

**cURL Request:**
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "9876543210",
    "otp": "123456"
  }'
```

**Response:**
```json
{
  "message": "OTP verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ec49f1b2c72b8c8e4f1a",
    "email": null,
    "mobile": "9876543210",
    "isVerified": true
  }
}
```

---

### 3. Register (Email/Password)

Register a new user with email and password.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "mobile": "9876543210",
  "password": "SecurePassword123"
}
```

**cURL Request:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123"
  }'
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ec49f1b2c72b8c8e4f1a",
    "email": "user@example.com",
    "mobile": null
  }
}
```

---

### 4. Login (Email/Password)

Login with email/mobile and password.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**cURL Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123"
  }'
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ec49f1b2c72b8c8e4f1a",
    "email": "user@example.com",
    "mobile": null
  }
}
```

---

### 5. Get Current User

Get authenticated user's information.

**Endpoint:** `GET /auth/me`

**Headers:** `Authorization: Bearer <token>`

**cURL Request:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "_id": "60d5ec49f1b2c72b8c8e4f1a",
  "email": "user@example.com",
  "mobile": "9876543210",
  "salary": 50000,
  "age": 28,
  "city": "Mumbai",
  "familyMembers": 2,
  "hasEMI": true,
  "emiAmount": 10000,
  "riskProfile": "moderate",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

---

## User Profile

### 1. Setup Salary

Setup user's salary and generate AI budget distribution.

**Endpoint:** `POST /users/setup-salary`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "salary": 50000,
  "age": 28,
  "city": "Mumbai",
  "familyMembers": 2,
  "hasEMI": true,
  "emiAmount": 10000
}
```

**cURL Request:**
```bash
curl -X POST http://localhost:5000/api/users/setup-salary \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "salary": 50000,
    "age": 28,
    "city": "Mumbai",
    "familyMembers": 2,
    "hasEMI": true,
    "emiAmount": 10000
  }'
```

**Response:**
```json
{
  "message": "Salary setup completed",
  "user": {
    "_id": "60d5ec49f1b2c72b8c8e4f1a",
    "salary": 50000,
    "age": 28,
    "city": "Mumbai",
    "familyMembers": 2,
    "hasEMI": true,
    "emiAmount": 10000
  },
  "budget": {
    "_id": "60d5ec49f1b2c72b8c8e4f2b",
    "userId": "60d5ec49f1b2c72b8c8e4f1a",
    "salary": 50000,
    "categories": {
      "rent": 15000,
      "food": 8750,
      "travel": 5000,
      "health": 3750,
      "investment": 7500,
      "emergency": 5000,
      "freeMoney": 5000,
      "emi": 10000,
      "shopping": 0,
      "utilities": 2500
    }
  }
}
```

---

### 2. Get User Profile

Get user's profile information.

**Endpoint:** `GET /users/profile`

**Headers:** `Authorization: Bearer <token>`

**cURL Request:**
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "_id": "60d5ec49f1b2c72b8c8e4f1a",
  "email": "user@example.com",
  "mobile": "9876543210",
  "salary": 50000,
  "age": 28,
  "city": "Mumbai",
  "familyMembers": 2,
  "hasEMI": true,
  "emiAmount": 10000,
  "riskProfile": "moderate"
}
```

---

### 3. Update User Profile

Update user's profile information.

**Endpoint:** `PUT /users/profile`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "age": 29,
  "city": "Bangalore",
  "riskProfile": "aggressive"
}
```

**cURL Request:**
```bash
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "age": 29,
    "city": "Bangalore",
    "riskProfile": "aggressive"
  }'
```

**Response:**
```json
{
  "_id": "60d5ec49f1b2c72b8c8e4f1a",
  "email": "user@example.com",
  "age": 29,
  "city": "Bangalore",
  "riskProfile": "aggressive"
}
```

---

## Budget

### 1. Get Budget Dashboard

Get budget dashboard with actual expenses vs budgeted amounts.

**Endpoint:** `GET /budget/dashboard`

**Headers:** `Authorization: Bearer <token>`

**cURL Request:**
```bash
curl -X GET http://localhost:5000/api/budget/dashboard \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "budget": {
    "salary": 50000,
    "categories": {
      "rent": 15000,
      "food": 8750,
      "travel": 5000,
      "health": 3750,
      "investment": 7500,
      "emergency": 5000,
      "freeMoney": 5000,
      "emi": 10000,
      "shopping": 0,
      "utilities": 2500
    },
    "actualExpenses": {
      "food": 9500,
      "travel": 4500,
      "rent": 15000,
      "shopping": 2000
    },
    "remaining": {
      "rent": 0,
      "food": -750,
      "travel": 500,
      "health": 3750,
      "investment": 7500,
      "emergency": 5000,
      "freeMoney": 5000,
      "emi": 10000,
      "shopping": -2000,
      "utilities": 2500
    },
    "totalSpent": 31000,
    "totalBudgeted": 67500
  }
}
```

---

### 2. Update Budget

Manually update budget categories.

**Endpoint:** `PUT /budget/update`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "categories": {
    "food": 10000,
    "travel": 6000
  }
}
```

**cURL Request:**
```bash
curl -X PUT http://localhost:5000/api/budget/update \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "categories": {
      "food": 10000,
      "travel": 6000
    }
  }'
```

**Response:**
```json
{
  "message": "Budget updated successfully",
  "budget": {
    "_id": "60d5ec49f1b2c72b8c8e4f2b",
    "categories": {
      "rent": 15000,
      "food": 10000,
      "travel": 6000,
      "health": 3750,
      "investment": 7500,
      "emergency": 5000,
      "freeMoney": 5000,
      "emi": 10000,
      "shopping": 0,
      "utilities": 2500
    }
  }
}
```

---

## Expenses

### 1. Add Manual Expense

Add a manual expense entry.

**Endpoint:** `POST /expenses/add`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "category": "food",
  "amount": 500,
  "description": "Lunch at restaurant",
  "date": "2024-01-15"
}
```

**cURL Request:**
```bash
curl -X POST http://localhost:5000/api/expenses/add \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "category": "food",
    "amount": 500,
    "description": "Lunch at restaurant",
    "date": "2024-01-15"
  }'
```

**Response:**
```json
{
  "message": "Expense added successfully",
  "expense": {
    "_id": "60d5ec49f1b2c72b8c8e4f3c",
    "userId": "60d5ec49f1b2c72b8c8e4f1a",
    "category": "food",
    "amount": 500,
    "description": "Lunch at restaurant",
    "date": "2024-01-15T00:00:00.000Z",
    "source": "manual",
    "createdAt": "2024-01-15T12:30:00.000Z"
  }
}
```

---

### 2. Get All Expenses

Get all expenses with optional filters.

**Endpoint:** `GET /expenses`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `category` (optional): Filter by category
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)
- `limit` (optional): Number of results (default: 50)
- `page` (optional): Page number (default: 1)

**cURL Request:**
```bash
# Get all expenses
curl -X GET "http://localhost:5000/api/expenses" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Get expenses by category
curl -X GET "http://localhost:5000/api/expenses?category=food" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Get expenses with date range
curl -X GET "http://localhost:5000/api/expenses?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Get expenses with pagination
curl -X GET "http://localhost:5000/api/expenses?limit=20&page=1" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "expenses": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f3c",
      "userId": "60d5ec49f1b2c72b8c8e4f1a",
      "category": "food",
      "amount": 500,
      "description": "Lunch at restaurant",
      "date": "2024-01-15T00:00:00.000Z",
      "source": "manual"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 50,
    "pages": 1
  }
}
```

---

### 3. Get Expense Summary

Get expense summary grouped by category.

**Endpoint:** `GET /expenses/summary`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)

**cURL Request:**
```bash
curl -X GET "http://localhost:5000/api/expenses/summary?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "summary": [
    {
      "_id": "food",
      "total": 9500,
      "count": 15
    },
    {
      "_id": "travel",
      "total": 4500,
      "count": 8
    },
    {
      "_id": "rent",
      "total": 15000,
      "count": 1
    }
  ]
}
```

---

### 4. Update Expense

Update an existing expense.

**Endpoint:** `PUT /expenses/:id`

**Headers:** `Authorization: Bearer <token>`

**cURL Request:**
```bash
curl -X PUT http://localhost:5000/api/expenses/60d5ec49f1b2c72b8c8e4f3c \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 600,
    "description": "Dinner at restaurant"
  }'
```

**Response:**
```json
{
  "message": "Expense updated successfully",
  "expense": {
    "_id": "60d5ec49f1b2c72b8c8e4f3c",
    "amount": 600,
    "description": "Dinner at restaurant"
  }
}
```

---

### 5. Delete Expense

Delete an expense.

**Endpoint:** `DELETE /expenses/:id`

**Headers:** `Authorization: Bearer <token>`

**cURL Request:**
```bash
curl -X DELETE http://localhost:5000/api/expenses/60d5ec49f1b2c72b8c8e4f3c \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "message": "Expense deleted successfully"
}
```

---

## Bank Statements

### 1. Upload Bank Statement

Upload and process bank statement (PDF/CSV/Image).

**Endpoint:** `POST /statements/upload`

**Headers:** `Authorization: Bearer <token>`

**Request:** `multipart/form-data`

**Form Data:**
- `statement`: File (PDF, CSV, or Image)

**cURL Request:**
```bash
curl -X POST http://localhost:5000/api/statements/upload \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "statement=@/path/to/bank_statement.pdf"
```

**Response:**
```json
{
  "message": "Statement uploaded successfully. Processing...",
  "statement": {
    "id": "60d5ec49f1b2c72b8c8e4f4d",
    "fileName": "bank_statement.pdf",
    "status": "processing"
  }
}
```

---

### 2. Get All Statements

Get all uploaded bank statements.

**Endpoint:** `GET /statements`

**Headers:** `Authorization: Bearer <token>`

**cURL Request:**
```bash
curl -X GET http://localhost:5000/api/statements \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "statements": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f4d",
      "fileName": "bank_statement.pdf",
      "fileType": "pdf",
      "status": "completed",
      "totalDebits": 31000,
      "totalCredits": 50000,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### 3. Get Statement Details

Get detailed information about a specific statement.

**Endpoint:** `GET /statements/:id`

**Headers:** `Authorization: Bearer <token>`

**cURL Request:**
```bash
curl -X GET http://localhost:5000/api/statements/60d5ec49f1b2c72b8c8e4f4d \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "statement": {
    "_id": "60d5ec49f1b2c72b8c8e4f4d",
    "fileName": "bank_statement.pdf",
    "fileType": "pdf",
    "extractedData": [
      {
        "date": "2024-01-10T00:00:00.000Z",
        "description": "SWIGGY FOOD DELIVERY",
        "amount": 450,
        "type": "debit",
        "category": "food",
        "confidence": 0.9
      }
    ],
    "totalDebits": 31000,
    "totalCredits": 50000,
    "status": "completed"
  },
  "expenses": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f5e",
      "category": "food",
      "amount": 450,
      "description": "SWIGGY FOOD DELIVERY",
      "source": "bank_statement"
    }
  ]
}
```

---

## AI Services

### 1. Get AI Financial Advice

Get AI-generated financial advice based on spending patterns.

**Endpoint:** `GET /ai/advice`

**Headers:** `Authorization: Bearer <token>`

**cURL Request:**
```bash
curl -X GET http://localhost:5000/api/ai/advice \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "advice": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f6f",
      "userId": "60d5ec49f1b2c72b8c8e4f1a",
      "adviceType": "spending",
      "category": "food",
      "message": "You are overspending ₹750 on food. Reduce food delivery apps by 20% to save ₹1,800/year.",
      "amount": 750,
      "priority": "high",
      "isRead": false,
      "createdAt": "2024-01-15T12:00:00.000Z"
    },
    {
      "_id": "60d5ec49f1b2c72b8c8e4f7g",
      "adviceType": "investment",
      "message": "You can invest ₹7,500/month in SIP for long-term wealth creation.",
      "amount": 7500,
      "priority": "high"
    }
  ]
}
```

---

### 2. Get All Saved Advice

Get all saved AI advice with pagination.

**Endpoint:** `GET /ai/advice/all`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `isRead` (optional): Filter by read status (true/false)
- `limit` (optional): Number of results (default: 20)
- `page` (optional): Page number (default: 1)

**cURL Request:**
```bash
# Get all advice
curl -X GET "http://localhost:5000/api/ai/advice/all" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Get unread advice
curl -X GET "http://localhost:5000/api/ai/advice/all?isRead=false" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "advice": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f6f",
      "adviceType": "spending",
      "message": "You are overspending ₹750 on food...",
      "isRead": false,
      "createdAt": "2024-01-15T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

---

### 3. Mark Advice as Read

Mark an advice as read.

**Endpoint:** `PUT /ai/advice/:id/read`

**Headers:** `Authorization: Bearer <token>`

**cURL Request:**
```bash
curl -X PUT http://localhost:5000/api/ai/advice/60d5ec49f1b2c72b8c8e4f6f/read \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "message": "Advice marked as read",
  "advice": {
    "_id": "60d5ec49f1b2c72b8c8e4f6f",
    "isRead": true
  }
}
```

---

### 4. Get Spending Analysis

Get detailed spending analysis comparing actual vs budgeted.

**Endpoint:** `GET /ai/analysis`

**Headers:** `Authorization: Bearer <token>`

**cURL Request:**
```bash
curl -X GET http://localhost:5000/api/ai/analysis \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "analysis": [
    {
      "category": "food",
      "budgeted": 8750,
      "actual": 9500,
      "variance": 750,
      "variancePercent": 8.57,
      "count": 15,
      "avgAmount": 633,
      "status": "over"
    },
    {
      "category": "travel",
      "budgeted": 5000,
      "actual": 4500,
      "variance": -500,
      "variancePercent": -10,
      "count": 8,
      "avgAmount": 563,
      "status": "under"
    },
    {
      "category": "rent",
      "budgeted": 15000,
      "actual": 15000,
      "variance": 0,
      "variancePercent": 0,
      "count": 1,
      "avgAmount": 15000,
      "status": "on_track"
    }
  ]
}
```

---

## Insurance

### 1. Get Insurance Recommendations

Get AI-generated insurance recommendations.

**Endpoint:** `GET /insurance/recommendations`

**Headers:** `Authorization: Bearer <token>`

**cURL Request:**
```bash
curl -X GET http://localhost:5000/api/insurance/recommendations \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "recommendations": [
    {
      "type": "health",
      "coverage": 500000,
      "premium": 833,
      "duration": 1,
      "provider": "Recommended: HDFC, ICICI, or Star Health",
      "message": "Health insurance with ₹5.0 lakh coverage"
    },
    {
      "type": "term",
      "coverage": 5000000,
      "premium": 500,
      "duration": 30,
      "provider": "Recommended: LIC, HDFC Life, or ICICI Prudential",
      "message": "Term life insurance with ₹5.0 crore coverage"
    }
  ]
}
```

---

### 2. Get All Insurance Policies

Get all insurance policies.

**Endpoint:** `GET /insurance`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `type` (optional): Filter by type (health/term/life)
- `status` (optional): Filter by status (suggested/pending/active)

**cURL Request:**
```bash
# Get all insurance
curl -X GET http://localhost:5000/api/insurance \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Get active health insurance
curl -X GET "http://localhost:5000/api/insurance?type=health&status=active" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "insurances": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f8h",
      "userId": "60d5ec49f1b2c72b8c8e4f1a",
      "type": "health",
      "coverage": 500000,
      "premium": 833,
      "duration": 1,
      "provider": "HDFC Health Insurance",
      "status": "active",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### 3. Add Insurance Policy

Add a new insurance policy.

**Endpoint:** `POST /insurance`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "type": "health",
  "coverage": 500000,
  "premium": 833,
  "duration": 1,
  "provider": "HDFC Health Insurance"
}
```

**cURL Request:**
```bash
curl -X POST http://localhost:5000/api/insurance \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "type": "health",
    "coverage": 500000,
    "premium": 833,
    "duration": 1,
    "provider": "HDFC Health Insurance"
  }'
```

**Response:**
```json
{
  "message": "Insurance policy added",
  "insurance": {
    "_id": "60d5ec49f1b2c72b8c8e4f8h",
    "type": "health",
    "coverage": 500000,
    "premium": 833,
    "status": "active"
  }
}
```

---

### 4. Update Insurance

Update an insurance policy.

**Endpoint:** `PUT /insurance/:id`

**Headers:** `Authorization: Bearer <token>`

**cURL Request:**
```bash
curl -X PUT http://localhost:5000/api/insurance/60d5ec49f1b2c72b8c8e4f8h \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "premium": 900,
    "status": "active"
  }'
```

**Response:**
```json
{
  "message": "Insurance updated",
  "insurance": {
    "_id": "60d5ec49f1b2c72b8c8e4f8h",
    "premium": 900,
    "status": "active"
  }
}
```

---

### 5. Delete Insurance

Delete an insurance policy.

**Endpoint:** `DELETE /insurance/:id`

**Headers:** `Authorization: Bearer <token>`

**cURL Request:**
```bash
curl -X DELETE http://localhost:5000/api/insurance/60d5ec49f1b2c72b8c8e4f8h \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "message": "Insurance deleted successfully"
}
```

---

## Investments

### 1. Get Investment Recommendations

Get AI-generated investment recommendations.

**Endpoint:** `GET /investments/recommendations`

**Headers:** `Authorization: Bearer <token>`

**cURL Request:**
```bash
curl -X GET http://localhost:5000/api/investments/recommendations \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "recommendations": [
    {
      "type": "sip",
      "amount": 7500,
      "frequency": "monthly",
      "expectedReturns": 10,
      "riskLevel": "medium",
      "message": "Monthly SIP of ₹7,500 in mutual funds"
    },
    {
      "type": "fd",
      "amount": 5000,
      "frequency": "monthly",
      "expectedReturns": 6.5,
      "riskLevel": "low",
      "message": "Build emergency fund with ₹5,000/month in FD"
    }
  ]
}
```

---

### 2. Get All Investments

Get all investments.

**Endpoint:** `GET /investments`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `type` (optional): Filter by type (sip/fd/mutual_fund/stocks/emergency_fund)
- `status` (optional): Filter by status (suggested/active/completed)

**cURL Request:**
```bash
# Get all investments
curl -X GET http://localhost:5000/api/investments \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Get active SIP investments
curl -X GET "http://localhost:5000/api/investments?type=sip&status=active" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "investments": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f9i",
      "userId": "60d5ec49f1b2c72b8c8e4f1a",
      "type": "sip",
      "amount": 7500,
      "frequency": "monthly",
      "expectedReturns": 10,
      "riskLevel": "medium",
      "status": "active",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### 3. Add Investment

Add a new investment.

**Endpoint:** `POST /investments`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "type": "sip",
  "amount": 7500,
  "frequency": "monthly",
  "expectedReturns": 10,
  "riskLevel": "medium"
}
```

**cURL Request:**
```bash
curl -X POST http://localhost:5000/api/investments \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "type": "sip",
    "amount": 7500,
    "frequency": "monthly",
    "expectedReturns": 10,
    "riskLevel": "medium"
  }'
```

**Response:**
```json
{
  "message": "Investment added",
  "investment": {
    "_id": "60d5ec49f1b2c72b8c8e4f9i",
    "type": "sip",
    "amount": 7500,
    "frequency": "monthly",
    "status": "active"
  }
}
```

---

### 4. Update Investment

Update an investment.

**Endpoint:** `PUT /investments/:id`

**Headers:** `Authorization: Bearer <token>`

**cURL Request:**
```bash
curl -X PUT http://localhost:5000/api/investments/60d5ec49f1b2c72b8c8e4f9i \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000,
    "status": "active"
  }'
```

**Response:**
```json
{
  "message": "Investment updated",
  "investment": {
    "_id": "60d5ec49f1b2c72b8c8e4f9i",
    "amount": 10000,
    "status": "active"
  }
}
```

---

### 5. Delete Investment

Delete an investment.

**Endpoint:** `DELETE /investments/:id`

**Headers:** `Authorization: Bearer <token>`

**cURL Request:**
```bash
curl -X DELETE http://localhost:5000/api/investments/60d5ec49f1b2c72b8c8e4f9i \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "message": "Investment deleted successfully"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

### 401 Unauthorized
```json
{
  "message": "No token, authorization denied"
}
```
or
```json
{
  "message": "Token is not valid"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

The token is obtained from:
- `/auth/verify-otp`
- `/auth/register`
- `/auth/login`

Tokens expire after 30 days.

---

## Expense Categories

Valid expense categories:
- `rent`
- `food`
- `travel`
- `health`
- `investment`
- `emergency`
- `emi`
- `shopping`
- `utilities`
- `other`

---

## File Upload

Bank statements can be uploaded as:
- **PDF** files (.pdf)
- **CSV** files (.csv)
- **Images** (.jpg, .jpeg, .png)

Maximum file size: 10MB

Use `multipart/form-data` content type with field name `statement`.

---

## Rate Limiting

Currently, there is no rate limiting implemented. For production, consider implementing rate limiting middleware.

---

## Notes

- All dates should be in ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)
- Amounts are in Indian Rupees (₹)
- All monetary values are stored as numbers (not strings)
- OTP is only returned in development mode
- Bank statement processing is asynchronous and may take time

