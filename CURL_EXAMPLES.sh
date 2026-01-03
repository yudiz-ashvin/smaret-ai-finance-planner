#!/bin/bash

# Smart AI Finance Planner - cURL Examples
# Base URL
BASE_URL="http://localhost:5000/api"

# Replace this with your actual token after authentication
TOKEN="your_jwt_token_here"

# ============================================
# AUTHENTICATION
# ============================================

# 1. Send OTP
echo "1. Sending OTP..."
curl -X POST $BASE_URL/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "9876543210"
  }'

# 2. Verify OTP (Save the token from response)
echo -e "\n\n2. Verifying OTP..."
curl -X POST $BASE_URL/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "9876543210",
    "otp": "123456"
  }'

# 3. Register with Email/Password
echo -e "\n\n3. Registering user..."
curl -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123"
  }'

# 4. Login with Email/Password
echo -e "\n\n4. Logging in..."
curl -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123"
  }'

# 5. Get Current User
echo -e "\n\n5. Getting current user..."
curl -X GET $BASE_URL/auth/me \
  -H "Authorization: Bearer $TOKEN"

# ============================================
# USER PROFILE
# ============================================

# 1. Setup Salary
echo -e "\n\n6. Setting up salary..."
curl -X POST $BASE_URL/users/setup-salary \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "salary": 50000,
    "age": 28,
    "city": "Mumbai",
    "familyMembers": 2,
    "hasEMI": true,
    "emiAmount": 10000
  }'

# 2. Get User Profile
echo -e "\n\n7. Getting user profile..."
curl -X GET $BASE_URL/users/profile \
  -H "Authorization: Bearer $TOKEN"

# 3. Update User Profile
echo -e "\n\n8. Updating user profile..."
curl -X PUT $BASE_URL/users/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 29,
    "city": "Bangalore",
    "riskProfile": "aggressive"
  }'

# ============================================
# BUDGET
# ============================================

# 1. Get Budget Dashboard
echo -e "\n\n9. Getting budget dashboard..."
curl -X GET $BASE_URL/budget/dashboard \
  -H "Authorization: Bearer $TOKEN"

# 2. Update Budget
echo -e "\n\n10. Updating budget..."
curl -X PUT $BASE_URL/budget/update \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categories": {
      "food": 10000,
      "travel": 6000
    }
  }'

# ============================================
# EXPENSES
# ============================================

# 1. Add Manual Expense
echo -e "\n\n11. Adding manual expense..."
curl -X POST $BASE_URL/expenses/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "food",
    "amount": 500,
    "description": "Lunch at restaurant",
    "date": "2024-01-15"
  }'

# 2. Get All Expenses
echo -e "\n\n12. Getting all expenses..."
curl -X GET "$BASE_URL/expenses" \
  -H "Authorization: Bearer $TOKEN"

# 3. Get Expenses by Category
echo -e "\n\n13. Getting expenses by category..."
curl -X GET "$BASE_URL/expenses?category=food" \
  -H "Authorization: Bearer $TOKEN"

# 4. Get Expenses with Date Range
echo -e "\n\n14. Getting expenses with date range..."
curl -X GET "$BASE_URL/expenses?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer $TOKEN"

# 5. Get Expense Summary
echo -e "\n\n15. Getting expense summary..."
curl -X GET "$BASE_URL/expenses/summary?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer $TOKEN"

# 6. Update Expense
echo -e "\n\n16. Updating expense..."
curl -X PUT $BASE_URL/expenses/EXPENSE_ID_HERE \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 600,
    "description": "Dinner at restaurant"
  }'

# 7. Delete Expense
echo -e "\n\n17. Deleting expense..."
curl -X DELETE $BASE_URL/expenses/EXPENSE_ID_HERE \
  -H "Authorization: Bearer $TOKEN"

# ============================================
# BANK STATEMENTS
# ============================================

# 1. Upload Bank Statement
echo -e "\n\n18. Uploading bank statement..."
curl -X POST $BASE_URL/statements/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "statement=@/path/to/bank_statement.pdf"

# 2. Get All Statements
echo -e "\n\n19. Getting all statements..."
curl -X GET $BASE_URL/statements \
  -H "Authorization: Bearer $TOKEN"

# 3. Get Statement Details
echo -e "\n\n20. Getting statement details..."
curl -X GET $BASE_URL/statements/STATEMENT_ID_HERE \
  -H "Authorization: Bearer $TOKEN"

# ============================================
# AI SERVICES
# ============================================

# 1. Get AI Financial Advice
echo -e "\n\n21. Getting AI financial advice..."
curl -X GET $BASE_URL/ai/advice \
  -H "Authorization: Bearer $TOKEN"

# 2. Get All Saved Advice
echo -e "\n\n22. Getting all saved advice..."
curl -X GET "$BASE_URL/ai/advice/all" \
  -H "Authorization: Bearer $TOKEN"

# 3. Get Unread Advice
echo -e "\n\n23. Getting unread advice..."
curl -X GET "$BASE_URL/ai/advice/all?isRead=false" \
  -H "Authorization: Bearer $TOKEN"

# 4. Mark Advice as Read
echo -e "\n\n24. Marking advice as read..."
curl -X PUT $BASE_URL/ai/advice/ADVICE_ID_HERE/read \
  -H "Authorization: Bearer $TOKEN"

# 5. Get Spending Analysis
echo -e "\n\n25. Getting spending analysis..."
curl -X GET $BASE_URL/ai/analysis \
  -H "Authorization: Bearer $TOKEN"

# ============================================
# INSURANCE
# ============================================

# 1. Get Insurance Recommendations
echo -e "\n\n26. Getting insurance recommendations..."
curl -X GET $BASE_URL/insurance/recommendations \
  -H "Authorization: Bearer $TOKEN"

# 2. Get All Insurance Policies
echo -e "\n\n27. Getting all insurance policies..."
curl -X GET $BASE_URL/insurance \
  -H "Authorization: Bearer $TOKEN"

# 3. Get Active Health Insurance
echo -e "\n\n28. Getting active health insurance..."
curl -X GET "$BASE_URL/insurance?type=health&status=active" \
  -H "Authorization: Bearer $TOKEN"

# 4. Add Insurance Policy
echo -e "\n\n29. Adding insurance policy..."
curl -X POST $BASE_URL/insurance \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "health",
    "coverage": 500000,
    "premium": 833,
    "duration": 1,
    "provider": "HDFC Health Insurance"
  }'

# 5. Update Insurance
echo -e "\n\n30. Updating insurance..."
curl -X PUT $BASE_URL/insurance/INSURANCE_ID_HERE \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "premium": 900,
    "status": "active"
  }'

# 6. Delete Insurance
echo -e "\n\n31. Deleting insurance..."
curl -X DELETE $BASE_URL/insurance/INSURANCE_ID_HERE \
  -H "Authorization: Bearer $TOKEN"

# ============================================
# INVESTMENTS
# ============================================

# 1. Get Investment Recommendations
echo -e "\n\n32. Getting investment recommendations..."
curl -X GET $BASE_URL/investments/recommendations \
  -H "Authorization: Bearer $TOKEN"

# 2. Get All Investments
echo -e "\n\n33. Getting all investments..."
curl -X GET $BASE_URL/investments \
  -H "Authorization: Bearer $TOKEN"

# 3. Get Active SIP Investments
echo -e "\n\n34. Getting active SIP investments..."
curl -X GET "$BASE_URL/investments?type=sip&status=active" \
  -H "Authorization: Bearer $TOKEN"

# 4. Add Investment
echo -e "\n\n35. Adding investment..."
curl -X POST $BASE_URL/investments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "sip",
    "amount": 7500,
    "frequency": "monthly",
    "expectedReturns": 10,
    "riskLevel": "medium"
  }'

# 5. Update Investment
echo -e "\n\n36. Updating investment..."
curl -X PUT $BASE_URL/investments/INVESTMENT_ID_HERE \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000,
    "status": "active"
  }'

# 6. Delete Investment
echo -e "\n\n37. Deleting investment..."
curl -X DELETE $BASE_URL/investments/INVESTMENT_ID_HERE \
  -H "Authorization: Bearer $TOKEN"

# ============================================
# HEALTH CHECK
# ============================================

# Health Check
echo -e "\n\n38. Health check..."
curl -X GET $BASE_URL/health

echo -e "\n\nDone!"

