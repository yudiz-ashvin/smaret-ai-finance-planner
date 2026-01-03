# Postman Collection Setup Guide

This guide will help you import and use the Postman collection for Smart AI Finance Planner API.

## Files Included

1. **Smart_AI_Finance_Planner.postman_collection.json** - Complete Postman collection with all API endpoints

## Importing the Collection

### Method 1: Import via File

1. Open Postman
2. Click **Import** button (top left)
3. Click **Upload Files**
4. Select `Smart_AI_Finance_Planner.postman_collection.json`
5. Click **Import**

### Method 2: Import via URL (if hosted)

1. Open Postman
2. Click **Import** button
3. Select **Link** tab
4. Paste the collection URL
5. Click **Continue** → **Import**

## Setting Up Environment Variables

The collection uses variables for easier testing. Set them up:

### Option 1: Collection Variables (Recommended)

1. Right-click on the collection name
2. Select **Edit**
3. Go to **Variables** tab
4. Set the following variables:
   - `base_url`: `http://localhost:5000/api`
   - `auth_token`: (Leave empty, will be auto-set after login)

### Option 2: Create Environment

1. Click **Environments** (left sidebar)
2. Click **+** to create new environment
3. Name it: `Smart Finance Planner - Local`
4. Add variables:
   - `base_url`: `http://localhost:5000/api`
   - `auth_token`: (Leave empty)
5. Click **Save**
6. Select this environment from the dropdown (top right)

## Using the Collection

### Step 1: Health Check

Start by testing the health endpoint:
- Go to **Health Check** → **Health Check**
- Click **Send**
- Should return `200 OK`

### Step 2: Authentication

Choose one authentication method:

#### Option A: OTP Login
1. Go to **Authentication** → **Send OTP**
2. Update the mobile number in the request body
3. Click **Send**
4. Check the response for OTP (development mode only)
5. Go to **Authentication** → **Verify OTP**
6. Enter the OTP received
7. Click **Send**
8. The token will be automatically saved to `auth_token` variable

#### Option B: Email/Password Login
1. Go to **Authentication** → **Register (Email/Password)** (first time)
   - Or **Login (Email/Password)** (if already registered)
2. Update email and password in request body
3. Click **Send**
4. The token will be automatically saved to `auth_token` variable

### Step 3: Setup Profile

1. Go to **User Profile** → **Setup Salary**
2. Update the salary, age, city, and other details
3. Click **Send**
4. This will create your budget automatically

### Step 4: Explore Endpoints

Now you can test all other endpoints:
- **Budget**: View and update your budget
- **Expenses**: Add, view, update, delete expenses
- **Bank Statements**: Upload and view statements
- **AI Services**: Get financial advice and analysis
- **Insurance**: Get recommendations and manage policies
- **Investments**: Get recommendations and manage investments

## Auto Token Management

The collection includes automatic token management:
- After successful login/register/verify-otp, the token is automatically saved
- All authenticated requests use `{{auth_token}}` variable
- No need to manually copy-paste tokens

## Tips for Testing

1. **Update IDs**: When testing update/delete endpoints, replace placeholder IDs:
   - `EXPENSE_ID_HERE`
   - `STATEMENT_ID_HERE`
   - `ADVICE_ID_HERE`
   - `INSURANCE_ID_HERE`
   - `INVESTMENT_ID_HERE`

2. **File Upload**: For bank statement upload:
   - Go to **Bank Statements** → **Upload Bank Statement**
   - Click **Body** tab
   - Under **form-data**, click **Select Files** for the `statement` field
   - Choose a PDF, CSV, or image file
   - Click **Send**

3. **Query Parameters**: Some endpoints support query parameters:
   - Modify the URL to add/change query parameters
   - Or use the **Params** tab in Postman

4. **Request Body**: 
   - Most POST/PUT requests use JSON body
   - Update the JSON in the **Body** tab (raw mode)
   - Ensure Content-Type is `application/json`

## Collection Structure

The collection is organized into folders:

```
Smart AI Finance Planner API
├── Authentication (5 requests)
│   ├── Send OTP
│   ├── Verify OTP
│   ├── Register (Email/Password)
│   ├── Login (Email/Password)
│   └── Get Current User
├── User Profile (3 requests)
│   ├── Setup Salary
│   ├── Get User Profile
│   └── Update User Profile
├── Budget (2 requests)
│   ├── Get Budget Dashboard
│   └── Update Budget
├── Expenses (7 requests)
│   ├── Add Manual Expense
│   ├── Get All Expenses
│   ├── Get Expenses by Category
│   ├── Get Expenses with Date Range
│   ├── Get Expense Summary
│   ├── Update Expense
│   └── Delete Expense
├── Bank Statements (3 requests)
│   ├── Upload Bank Statement
│   ├── Get All Statements
│   └── Get Statement Details
├── AI Services (5 requests)
│   ├── Get AI Financial Advice
│   ├── Get All Saved Advice
│   ├── Get Unread Advice
│   ├── Mark Advice as Read
│   └── Get Spending Analysis
├── Insurance (6 requests)
│   ├── Get Insurance Recommendations
│   ├── Get All Insurance Policies
│   ├── Get Active Health Insurance
│   ├── Add Insurance Policy
│   ├── Update Insurance
│   └── Delete Insurance
├── Investments (6 requests)
│   ├── Get Investment Recommendations
│   ├── Get All Investments
│   ├── Get Active SIP Investments
│   ├── Add Investment
│   ├── Update Investment
│   └── Delete Investment
└── Health Check (1 request)
    └── Health Check
```

**Total: 38 API endpoints**

## Troubleshooting

### Token Not Working
- Make sure you've logged in successfully
- Check that `auth_token` variable is set (View → Show Postman Console)
- Try logging in again to refresh the token

### Connection Refused
- Make sure your server is running on `http://localhost:5000`
- Check the `base_url` variable is correct
- Verify MongoDB is running

### 401 Unauthorized
- Token may have expired (30 days validity)
- Login again to get a new token
- Check Authorization header is set correctly

### 400 Bad Request
- Check request body format (valid JSON)
- Verify all required fields are present
- Check data types match expected format

## Sharing the Collection

To share with your team:

1. Right-click collection → **Export**
2. Choose **Collection v2.1**
3. Save and share the JSON file
4. Team members can import it using the same steps

## Running Collection (Newman)

To run the collection from command line using Newman:

```bash
# Install Newman
npm install -g newman

# Run collection
newman run Smart_AI_Finance_Planner.postman_collection.json

# Run with environment
newman run Smart_AI_Finance_Planner.postman_collection.json -e environment.json

# Run with HTML report
newman run Smart_AI_Finance_Planner.postman_collection.json -r html
```

## Additional Resources

- [Postman Documentation](https://learning.postman.com/docs/)
- [API Documentation](./API_DOCUMENTATION.md)
- [cURL Examples](./CURL_EXAMPLES.sh)

