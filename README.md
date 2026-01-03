# Smart AI Finance Planner

**Tagline:** "Your Salary. Your Life. Our AI."

An AI-powered personal finance management platform that helps users take full control of their salary, spending, savings, and financial future.

## Features

- ✅ User Authentication (OTP/Email-Password)
- ✅ Salary Setup & Profile Management
- ✅ AI Smart Budget Distribution
- ✅ Expense Tracking (Manual & Bank Statement)
- ✅ Bank Statement Upload (PDF/CSV/Images) with AI Categorization
- ✅ AI Money Coach (Financial Advice)
- ✅ Insurance Recommendations
- ✅ Investment Suggestions
- ✅ Spending Analysis & Reports

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **AI:** OpenAI GPT-3.5 (for categorization and advice)
- **Authentication:** JWT, OTP
- **File Upload:** Multer

## Installation

1. **Clone the repository**
```bash
cd Ai-thon
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-finance-planner
JWT_SECRET=your_jwt_secret_key_here
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
```

4. **Start MongoDB**
Make sure MongoDB is running on your system.

5. **Run the application**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to mobile/email
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current user (requires auth)

### User Profile
- `POST /api/users/setup-salary` - Setup salary and generate budget
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Budget
- `GET /api/budget/dashboard` - Get budget dashboard with actual vs budgeted
- `PUT /api/budget/update` - Update budget categories

### Expenses
- `POST /api/expenses/add` - Add manual expense
- `GET /api/expenses` - Get all expenses (with filters)
- `GET /api/expenses/summary` - Get expense summary by category
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Bank Statements
- `POST /api/statements/upload` - Upload bank statement (PDF/CSV/Image)
- `GET /api/statements` - Get all statements
- `GET /api/statements/:id` - Get statement details

### AI Services
- `GET /api/ai/advice` - Get AI financial advice
- `GET /api/ai/advice/all` - Get all saved advice
- `PUT /api/ai/advice/:id/read` - Mark advice as read
- `GET /api/ai/analysis` - Get spending analysis

### Insurance
- `GET /api/insurance/recommendations` - Get AI insurance recommendations
- `GET /api/insurance` - Get all insurance policies
- `POST /api/insurance` - Add insurance policy
- `PUT /api/insurance/:id` - Update insurance
- `DELETE /api/insurance/:id` - Delete insurance

### Investments
- `GET /api/investments/recommendations` - Get AI investment recommendations
- `GET /api/investments` - Get all investments
- `POST /api/investments` - Add investment
- `PUT /api/investments/:id` - Update investment
- `DELETE /api/investments/:id` - Delete investment

## Project Structure

```
Ai-thon/
├── models/          # MongoDB models
│   ├── User.js
│   ├── Budget.js
│   ├── Expense.js
│   ├── BankStatement.js
│   ├── Insurance.js
│   ├── Investment.js
│   └── AIAdvice.js
├── routes/          # API routes
│   ├── auth.js
│   ├── users.js
│   ├── budget.js
│   ├── expenses.js
│   ├── statements.js
│   ├── ai.js
│   ├── insurance.js
│   └── investments.js
├── middleware/      # Middleware
│   └── auth.js
├── services/        # Business logic
│   └── aiService.js
├── uploads/         # Uploaded files
├── server.js        # Main server file
└── package.json
```

## AI Features

### Smart Budget Distribution
The AI automatically distributes salary into categories based on:
- Salary amount
- Age
- City (metro vs non-metro)
- Family size
- EMI obligations

### Expense Categorization
AI categorizes expenses from bank statements using:
- OpenAI GPT-3.5 for intelligent categorization
- Fallback keyword matching

### Financial Advice
AI generates personalized financial advice based on:
- Spending patterns
- Budget vs actual expenses
- Investment opportunities
- Insurance needs

## Usage Example

1. **Register/Login**
```bash
POST /api/auth/send-otp
{
  "mobile": "9876543210"
}

POST /api/auth/verify-otp
{
  "mobile": "9876543210",
  "otp": "123456"
}
```

2. **Setup Salary**
```bash
POST /api/users/setup-salary
Headers: { Authorization: "Bearer <token>" }
{
  "salary": 50000,
  "age": 28,
  "city": "Mumbai",
  "familyMembers": 2,
  "hasEMI": true,
  "emiAmount": 10000
}
```

3. **Get Budget Dashboard**
```bash
GET /api/budget/dashboard
Headers: { Authorization: "Bearer <token>" }
```

4. **Upload Bank Statement**
```bash
POST /api/statements/upload
Headers: { Authorization: "Bearer <token>" }
Body: FormData with file field "statement"
```

5. **Get AI Advice**
```bash
GET /api/ai/advice
Headers: { Authorization: "Bearer <token>" }
```

## Notes

- Make sure to set up your OpenAI API key in `.env` for AI features
- OTP is logged to console in development mode
- Bank statement processing is async and may take time for large files
- For production, implement proper SMS/Email service for OTP

## License

ISC

# smaret-ai-finance-planner
