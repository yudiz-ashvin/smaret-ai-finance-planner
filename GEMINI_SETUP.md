# Google Gemini API Setup (FREE Alternative to OpenAI)

Google Gemini API is a **FREE** alternative to OpenAI that works perfectly for this project. It has generous rate limits and no credit card required for basic usage.

## Why Use Gemini API?

✅ **100% FREE** - No credit card required  
✅ **Generous rate limits** - Perfect for development and small projects  
✅ **High quality responses** - Powered by Google's Gemini 1.5 Flash model  
✅ **Easy to set up** - Just need a Google account

## Step-by-Step Setup

### 1. Get Your Gemini API Key

1. Go to **https://makersuite.google.com/app/apikey**
2. Sign in with your Google account (Gmail account)
3. Click **"Create API Key"** button
4. Choose an existing Google Cloud project or create a new one
5. Copy the API key that is generated

### 2. Add to Your `.env` File

Add the Gemini API key to your `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Important**: Remove or comment out `OPENAI_API_KEY` if you want to use only Gemini:

```env
# OPENAI_API_KEY=your_openai_api_key_here  # Commented out - using Gemini instead
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Install Dependencies

The package is already added to `package.json`. Just install:

```bash
npm install
```

This will install `@google/generative-ai` package.

### 4. Restart Your Server

```bash
npm run dev
# or
npm start
```

## How It Works

The application is configured to:

1. **First try Gemini API** (if `GEMINI_API_KEY` is set)
2. **Fallback to OpenAI** (if Gemini fails and `OPENAI_API_KEY` is set)
3. **Use keyword-based categorization** (if no AI API is available)

## API Limits

### Free Tier Limits:

- **60 requests per minute** (RPM)
- **1,500 requests per day** (RPD)
- **32,000 tokens per minute** (TPM)

These limits are very generous for development and small projects!

## Testing

Once you've set up the API key, test it by:

1. **Upload a bank statement** - The AI will categorize expenses
2. **Get AI financial advice** - The AI will generate personalized advice
3. Check console logs for any errors

## Troubleshooting

### API Key Not Working?

- Make sure you copied the entire API key
- Check that there are no extra spaces in your `.env` file
- Restart your server after adding the key

### Getting Rate Limit Errors?

- The free tier has limits, but they're generous
- Wait a minute and try again
- Check your usage at https://makersuite.google.com/app/apikey

### API Key Invalid?

- Generate a new API key from https://makersuite.google.com/app/apikey
- Make sure you're using the correct key in your `.env` file

## Benefits Over OpenAI

| Feature     | Gemini (FREE)       | OpenAI (Paid)        |
| ----------- | ------------------- | -------------------- |
| Cost        | FREE                | $0.002 per 1K tokens |
| Setup       | Google account only | Credit card required |
| Rate Limits | 60 RPM, 1500 RPD    | Varies by plan       |
| Quality     | Excellent           | Excellent            |

## Additional Resources

- [Google AI Studio](https://makersuite.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Gemini Pro Model Info](https://ai.google.dev/models/gemini)

---

**Note**: This project automatically uses Gemini if the API key is provided. No code changes needed!
