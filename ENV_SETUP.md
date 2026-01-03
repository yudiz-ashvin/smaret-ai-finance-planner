# Environment Variables Setup

Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-finance-planner
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
```

## Variable Descriptions

- **PORT**: Server port (default: 5000)
- **MONGODB_URI**: MongoDB connection string
- **JWT_SECRET**: Secret key for JWT token signing (use a strong random string)
- **GEMINI_API_KEY**: (Recommended - FREE) Google Gemini API key for AI features
- **OPENAI_API_KEY**: (Optional) OpenAI API key (only used if Gemini key not provided)
- **NODE_ENV**: Environment mode (development/production)

## Getting Google Gemini API Key (FREE - Recommended)

1. Go to https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key
5. Paste it in your `.env` file as `GEMINI_API_KEY`

**Note**: Gemini API is FREE and has generous limits. Perfect for development and small projects!

## Getting OpenAI API Key (Optional - Paid)

1. Go to https://platform.openai.com
2. Sign up or login
3. Navigate to API Keys section
4. Create a new API key
5. Copy and paste it in your `.env` file

**Note**: OpenAI API requires paid credits. Use Gemini API for free alternative.

## Security Notes

- Never commit `.env` file to version control
- Use different secrets for development and production
- Keep your OpenAI API key secure and don't share it publicly
