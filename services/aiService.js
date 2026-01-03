const OpenAI = require('openai');
const { GoogleGenAI } = require('@google/genai');

const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

// Initialize AI clients - prefer Gemini (free), fallback to OpenAI
const useGemini = process.env.GEMINI_API_KEY;
const useOpenAI = process.env.OPENAI_API_KEY && !useGemini;

const openai = useOpenAI
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

// Initialize Gemini - @google/genai package (official docs)
// https://ai.google.dev/gemini-api/docs/text-generation#javascript
const gemini = useGemini
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

// AI Budget Distribution based on salary and user profile
async function generateSmartBudget(
  salary,
  age,
  city,
  familyMembers,
  hasEMI,
  emiAmount
) {
  // Use AI if available, otherwise fallback to static calculation
  if (process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY) {
    try {
      const prompt = `You are a personal finance advisor for middle-class salaried people in India. Create a smart monthly budget distribution.

User Profile:
- Monthly Salary: ₹${salary.toLocaleString('en-IN')}
- Age: ${age} years
- City: ${city || 'Not specified'}
- Family Members: ${familyMembers || 1}
- Has EMI: ${hasEMI ? 'Yes' : 'No'}
- EMI Amount: ${
        hasEMI && emiAmount ? `₹${emiAmount.toLocaleString('en-IN')}` : 'None'
      }

Create a budget distribution in JSON format with these categories:
{
  "rent": amount_in_rupees,
  "food": amount_in_rupees,
  "travel": amount_in_rupees,
  "health": amount_in_rupees,
  "investment": amount_in_rupees,
  "emergency": amount_in_rupees,
  "freeMoney": amount_in_rupees,
  "emi": amount_in_rupees (0 if no EMI),
  "shopping": amount_in_rupees,
  "utilities": amount_in_rupees
}

Guidelines:
- Total of all categories MUST equal exactly ₹${salary} (not more, not less)
- Rent: 25-35% of salary (higher for metro cities like Mumbai, Delhi, Bangalore)
- Food: 15-20% of salary (increase by 30% per additional family member)
- Travel: 8-12% of salary
- Health: 5-8% of salary (increase by 20% per additional family member)
- Investment: 15-20% of salary (crucial for long-term wealth)
- Emergency: 10-15% of salary (for emergency fund)
- Utilities: 3-5% of salary
- Shopping: 5-10% of salary
- Free Money: Remaining after all allocations
- EMI: Use exact EMI amount if provided, otherwise 0

Important: Ensure the sum of all amounts equals exactly ₹${salary}. Adjust freeMoney to balance if needed.

Return ONLY valid JSON object, no other text.`;

      const aiResponse = await callAI(prompt, {
        temperature: 0.5,
        maxTokens: 600,
      });

      // Parse AI response
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const aiBudget = JSON.parse(jsonMatch[0]);

          // Validate and normalize AI budget
          const categories = normalizeBudget(
            aiBudget,
            salary,
            hasEMI,
            emiAmount
          );

          // Verify total equals salary
          const total = Object.values(categories).reduce(
            (sum, val) => sum + val,
            0
          );
          if (Math.abs(total - salary) > 1) {
            // Adjust freeMoney to balance
            const diff = salary - total;
            categories.freeMoney = Math.max(
              0,
              (categories.freeMoney || 0) + diff
            );
          }

          console.log('✅ AI-generated smart budget');
          return categories;
        }
      } catch (parseError) {
        console.warn(
          'Failed to parse AI budget JSON, using fallback:',
          parseError.message
        );
      }
    } catch (error) {
      console.warn(
        'AI budget generation failed, using fallback:',
        error.message
      );
    }
  }

  // Fallback to static calculation with proper normalization
  return generateStaticBudget(
    salary,
    age,
    city,
    familyMembers,
    hasEMI,
    emiAmount
  );
}

// Fallback static budget calculation with proper normalization
function generateStaticBudget(
  salary,
  age,
  city,
  familyMembers,
  hasEMI,
  emiAmount
) {
  // Base distribution percentages (must sum to 100%)
  const basePercentages = {
    rent: 0.3, // 30%
    food: 0.175, // 17.5%
    travel: 0.1, // 10%
    health: 0.075, // 7.5%
    investment: 0.15, // 15%
    emergency: 0.1, // 10%
    freeMoney: 0.1, // 10%
    emi: 0,
    shopping: 0,
    utilities: 0.05, // 5%
  };

  // Adjust for EMI (fixed amount, not percentage)
  let emiFixed = 0;
  if (hasEMI && emiAmount > 0) {
    emiFixed = emiAmount;
    // Reduce available salary for other categories
    const availableSalary = salary - emiFixed;
    // Recalculate percentages based on available salary
    const totalPercentage = Object.keys(basePercentages)
      .filter((key) => key !== 'emi')
      .reduce((sum, key) => sum + basePercentages[key], 0);

    // Normalize percentages to fit available salary
    Object.keys(basePercentages).forEach((key) => {
      if (key !== 'emi') {
        basePercentages[key] =
          (basePercentages[key] / totalPercentage) * (availableSalary / salary);
      }
    });
  }

  // Adjust for family size
  if (familyMembers > 1) {
    const familyMultiplier = 1 + (familyMembers - 1) * 0.3;
    basePercentages.food *= familyMultiplier;
    basePercentages.health *= 1 + (familyMembers - 1) * 0.2;
  }

  // Adjust for city (metro cities have higher rent)
  const metroCities = [
    'mumbai',
    'delhi',
    'bangalore',
    'hyderabad',
    'chennai',
    'pune',
    'kolkata',
  ];
  if (metroCities.includes(city?.toLowerCase())) {
    basePercentages.rent = Math.min(basePercentages.rent * 1.2, 0.4);
  }

  // Normalize percentages to ensure total doesn't exceed 100% (excluding EMI)
  const totalPercentage = Object.keys(basePercentages)
    .filter((key) => key !== 'emi')
    .reduce((sum, key) => sum + basePercentages[key], 0);

  if (totalPercentage > 1) {
    // Scale down all percentages proportionally
    Object.keys(basePercentages).forEach((key) => {
      if (key !== 'emi') {
        basePercentages[key] = basePercentages[key] / totalPercentage;
      }
    });
  }

  // Calculate amounts
  const categories = {};
  const availableForPercentages = salary - emiFixed;

  Object.keys(basePercentages).forEach((key) => {
    if (key === 'emi') {
      categories[key] = emiFixed;
    } else {
      categories[key] = Math.round(
        availableForPercentages * basePercentages[key]
      );
    }
  });

  // Final normalization: ensure total equals salary exactly
  const total = Object.values(categories).reduce((sum, val) => sum + val, 0);
  const diff = salary - total;

  if (Math.abs(diff) > 0) {
    // Adjust freeMoney to balance (or shopping if freeMoney is too small)
    if (categories.freeMoney >= Math.abs(diff)) {
      categories.freeMoney += diff;
    } else if (categories.shopping >= Math.abs(diff)) {
      categories.shopping += diff;
    } else {
      // Distribute difference across non-essential categories
      categories.freeMoney = Math.max(0, categories.freeMoney + diff);
    }
  }

  return categories;
}

// Helper function to normalize AI-generated budget
function normalizeBudget(aiBudget, salary, hasEMI, emiAmount) {
  const categories = {
    rent: 0,
    food: 0,
    travel: 0,
    health: 0,
    investment: 0,
    emergency: 0,
    freeMoney: 0,
    emi: hasEMI && emiAmount ? emiAmount : 0,
    shopping: 0,
    utilities: 0,
  };

  // Extract values from AI response
  Object.keys(categories).forEach((key) => {
    if (aiBudget[key] !== undefined) {
      categories[key] = Math.round(Math.max(0, Number(aiBudget[key]) || 0));
    }
  });

  // Ensure EMI is correct
  if (hasEMI && emiAmount) {
    categories.emi = emiAmount;
  } else {
    categories.emi = 0;
  }

  // Calculate total and normalize
  const total = Object.values(categories).reduce((sum, val) => sum + val, 0);
  const diff = salary - total;

  if (Math.abs(diff) > 0) {
    // Adjust freeMoney to balance
    categories.freeMoney = Math.max(0, categories.freeMoney + diff);
  }

  return categories;
}

// Helper function to call AI API (Gemini or OpenAI)
async function callAI(prompt, options = {}) {
  const { temperature = 0.7, maxTokens = 500 } = options;

  // Try Gemini first (free)
  if (gemini) {
    // Try different model names in order (newer models first)
    const modelNames = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-2.5-pro',
    ];
    let lastError;

    for (const modelName of modelNames) {
      try {
        // @google/genai package API (official docs)
        // https://ai.google.dev/gemini-api/docs/text-generation#javascript
        const response = await gemini.models.generateContent({
          model: modelName,
          contents: prompt,
        });

        // Handle different response structures
        let text = '';
        if (response.text) {
          text =
            typeof response.text === 'string'
              ? response.text
              : response.text.toString();
        } else if (
          response.candidates &&
          response.candidates[0] &&
          response.candidates[0].content
        ) {
          text = response.candidates[0].content.parts[0].text;
        } else {
          console.error('Unexpected response structure:', response);
          throw new Error('Unexpected response structure from Gemini API');
        }

        return text.trim();
      } catch (error) {
        // Detailed error logging
        console.error('=== Gemini API Error Details ===');
        console.error('Model:', modelName);
        console.error('Error Message:', error.message);
        console.error('Error Code:', error.code);
        console.error('Error Status:', error.status);
        console.error('Error Stack:', error.stack);
        console.error(
          'Full Error Object:',
          JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
        );
        console.error('================================');
        lastError = error;
        // Only log if it's the last model attempt
        if (modelNames.indexOf(modelName) === modelNames.length - 1) {
          console.warn(`Gemini model ${modelName} failed:`, error.message);
        }
        // Try next model
        continue;
      }
    }

    // If all Gemini models failed, try OpenAI fallback
    console.warn('All Gemini models failed, trying OpenAI fallback');
    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: maxTokens,
        });
        return response.choices[0].message.content.trim();
      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError.message);
        throw lastError; // Throw the last Gemini error
      }
    }

    // If no fallback available, throw the last error
    throw lastError;
  }

  // Try OpenAI if available
  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: maxTokens,
      });
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('OpenAI API error:', error.message);
      throw error;
    }
  }

  throw new Error('No AI service available');
}

// AI-powered expense categorization
async function categorizeExpense(description, amount) {
  // Check if any AI API key is available
  if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
    return categorizeByKeywords(description);
  }

  const prompt = `Categorize this expense into one of these categories: rent, food, travel, health, investment, emergency, emi, shopping, utilities, other.
    
Expense description: "${description}"
Amount: ₹${amount}

Return only the category name in lowercase.`;

  try {
    const categoryText = await callAI(prompt, {
      temperature: 0.3,
      maxTokens: 10,
    });
    const category = categoryText.toLowerCase().trim();

    const validCategories = [
      'rent',
      'food',
      'travel',
      'health',
      'investment',
      'emergency',
      'emi',
      'shopping',
      'utilities',
      'other',
    ];

    // Extract category from response (in case AI returns extra text)
    for (const cat of validCategories) {
      if (category.includes(cat)) {
        return cat;
      }
    }

    return 'other';
  } catch (error) {
    // Handle AI API errors gracefully
    if (error.code === 'insufficient_quota' || error.status === 429) {
      console.warn('AI API quota exceeded, using keyword-based categorization');
    } else {
      console.error('AI categorization error:', error.message || error);
    }
    // Fallback to simple keyword matching
    return categorizeByKeywords(description);
  }
}

// Fallback categorization using keywords
function categorizeByKeywords(description) {
  const desc = description.toLowerCase();

  if (desc.includes('rent') || desc.includes('house') || desc.includes('room'))
    return 'rent';
  if (
    desc.includes('food') ||
    desc.includes('restaurant') ||
    desc.includes('zomato') ||
    desc.includes('swiggy') ||
    desc.includes('grocery')
  )
    return 'food';
  if (
    desc.includes('uber') ||
    desc.includes('ola') ||
    desc.includes('taxi') ||
    desc.includes('fuel') ||
    desc.includes('petrol') ||
    desc.includes('bus') ||
    desc.includes('metro')
  )
    return 'travel';
  if (
    desc.includes('hospital') ||
    desc.includes('pharmacy') ||
    desc.includes('medicine') ||
    desc.includes('doctor')
  )
    return 'health';
  if (
    desc.includes('emi') ||
    desc.includes('loan') ||
    desc.includes('repayment')
  )
    return 'emi';
  if (
    desc.includes('mall') ||
    desc.includes('amazon') ||
    desc.includes('flipkart') ||
    desc.includes('shopping') ||
    desc.includes('clothes')
  )
    return 'shopping';
  if (
    desc.includes('electricity') ||
    desc.includes('water') ||
    desc.includes('internet') ||
    desc.includes('phone')
  )
    return 'utilities';

  return 'other';
}

// Generate AI financial advice
async function generateFinancialAdvice(userId, budget, expenses) {
  try {
    const expenseSummary = {};
    expenses.forEach((exp) => {
      expenseSummary[exp.category] =
        (expenseSummary[exp.category] || 0) + exp.amount;
    });

    const adviceList = [];

    // Use AI to analyze spending patterns and generate personalized advice
    if (process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY) {
      try {
        const prompt = `You are a personal finance coach for a middle-class salaried person in India. Analyze their financial situation and provide actionable advice.

User Profile:
- Monthly Salary: ₹${budget.salary.toLocaleString('en-IN')}
- Budget Distribution: ${JSON.stringify(budget.categories, null, 2)}
- Actual Spending This Month: ${JSON.stringify(expenseSummary, null, 2)}

Provide personalized financial advice in JSON format with this structure:
[
  {
    "type": "spending|investment|saving|general",
    "category": "category_name (if spending)",
    "message": "Actionable advice message (max 150 words)",
    "amount": overspend_or_suggested_amount,
    "priority": "high|medium|low"
  }
]

Focus on:
1. Overspending categories (if actual > budget by 10%)
2. Investment opportunities based on salary
3. Emergency fund status
4. Money-saving tips specific to their spending patterns
5. Long-term financial planning

Return ONLY valid JSON array, no other text.`;

        const aiResponse = await callAI(prompt, {
          temperature: 0.7,
          maxTokens: 1000,
        });

        // Parse AI response
        try {
          // Extract JSON from response (in case there's extra text)
          const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const aiAdvice = JSON.parse(jsonMatch[0]);
            if (Array.isArray(aiAdvice) && aiAdvice.length > 0) {
              adviceList.push(...aiAdvice);
              console.log('✅ AI-generated financial advice added');
            }
          }
        } catch (parseError) {
          console.warn(
            'Failed to parse AI advice JSON, using fallback:',
            parseError.message
          );
          // Fallback to basic advice
          generateBasicAdvice(budget, expenseSummary, adviceList);
        }
      } catch (error) {
        console.warn(
          'AI advice generation failed, using fallback:',
          error.message
        );
        // Fallback to basic advice
        generateBasicAdvice(budget, expenseSummary, adviceList);
      }
    } else {
      // No AI available, use basic advice
      generateBasicAdvice(budget, expenseSummary, adviceList);
    }

    return adviceList;
  } catch (error) {
    console.error('Error generating financial advice:', error);
    return [];
  }
}

// Helper function for basic advice (fallback)
function generateBasicAdvice(budget, expenseSummary, adviceList) {
  // Compare actual vs budget
  Object.keys(budget.categories).forEach((category) => {
    const budgeted = budget.categories[category];
    const actual = expenseSummary[category] || 0;

    if (actual > budgeted * 1.1) {
      const overspend = actual - budgeted;
      let message = '';

      if (category === 'food') {
        message = `You are overspending ₹${overspend.toLocaleString(
          'en-IN'
        )} on ${category}. Reduce food delivery apps by 20% to save ₹${Math.round(
          overspend * 0.2 * 12
        )}/year.`;
      } else if (category === 'shopping') {
        message = `Your ${category} spending is ₹${overspend.toLocaleString(
          'en-IN'
        )} over budget. Consider waiting 24 hours before non-essential purchases.`;
      } else {
        message = `You are overspending ₹${overspend.toLocaleString(
          'en-IN'
        )} on ${category}. Review your ${category} expenses to stay within budget.`;
      }

      adviceList.push({
        type: 'spending',
        category,
        message,
        amount: overspend,
        priority: overspend > budgeted * 0.2 ? 'high' : 'medium',
      });
    }
  });

  // Investment advice
  if (budget.categories.investment < budget.salary * 0.1) {
    const suggestedAmount = Math.round(budget.salary * 0.15);
    adviceList.push({
      type: 'investment',
      message: `You can invest ₹${suggestedAmount.toLocaleString(
        'en-IN'
      )}/month in SIP for long-term wealth creation.`,
      amount: suggestedAmount,
      priority: 'high',
    });
  }

  // Emergency fund advice
  if (budget.categories.emergency < budget.salary * 3) {
    adviceList.push({
      type: 'saving',
      message:
        'Your emergency fund is low. Aim to build 6 months of expenses as an emergency fund.',
      priority: 'high',
    });
  }
}

// Generate AI-powered insurance recommendations
async function generateInsuranceRecommendations(salary, age, familyMembers) {
  // Use AI if available, otherwise fallback to static recommendations
  if (process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY) {
    try {
      const prompt = `You are an insurance advisor for middle-class salaried people in India. Recommend insurance plans based on:

User Profile:
- Monthly Salary: ₹${salary.toLocaleString('en-IN')}
- Age: ${age} years
- Family Members: ${familyMembers}

Provide insurance recommendations in JSON format:
[
  {
    "type": "health|term|accident|critical_illness",
    "coverage": coverage_amount_in_rupees,
    "premium": monthly_premium_in_rupees,
    "duration": policy_duration_years,
    "provider": "Recommended insurance companies (comma separated)",
    "message": "Brief explanation of why this insurance is needed (max 100 words)"
  }
]

Guidelines:
- Health Insurance: At least 10x monthly salary, more if family members > 1
- Term Insurance: 100x monthly salary if age < 50, 50x if age 50-60
- Consider family size for health insurance coverage
- Premium should be realistic (1-2% of salary for health, 0.5-1% for term)

Return ONLY valid JSON array, no other text.`;

      const aiResponse = await callAI(prompt, {
        temperature: 0.6,
        maxTokens: 800,
      });

      // Parse AI response
      try {
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const aiRecommendations = JSON.parse(jsonMatch[0]);
          if (
            Array.isArray(aiRecommendations) &&
            aiRecommendations.length > 0
          ) {
            console.log('✅ AI-generated insurance recommendations');
            return aiRecommendations;
          }
        }
      } catch (parseError) {
        console.warn(
          'Failed to parse AI insurance JSON, using fallback:',
          parseError.message
        );
      }
    } catch (error) {
      console.warn(
        'AI insurance recommendation failed, using fallback:',
        error.message
      );
    }
  }

  // Fallback to static recommendations
  return generateStaticInsuranceRecommendations(salary, age, familyMembers);
}

// Fallback static insurance recommendations
function generateStaticInsuranceRecommendations(salary, age, familyMembers) {
  const recommendations = [];

  // Health Insurance
  const healthCoverage = Math.max(
    300000,
    salary * 10 * (familyMembers > 1 ? 1.5 : 1)
  );
  const healthPremium = Math.round((healthCoverage / 1000000) * 12000);

  recommendations.push({
    type: 'health',
    coverage: healthCoverage,
    premium: Math.round(healthPremium / 12),
    duration: 1,
    provider: 'Recommended: HDFC, ICICI, or Star Health',
    message: `Health insurance with ₹${(healthCoverage / 100000).toFixed(
      1
    )} lakh coverage for ${familyMembers} family member(s)`,
  });

  // Term Insurance (if age < 50)
  if (age < 50) {
    const termCoverage = Math.max(5000000, salary * 100);
    const termPremium = Math.round((termCoverage / 1000000) * 6000);

    recommendations.push({
      type: 'term',
      coverage: termCoverage,
      premium: Math.round(termPremium / 12),
      duration: 30,
      provider: 'Recommended: LIC, HDFC Life, or ICICI Prudential',
      message: `Term life insurance with ₹${(termCoverage / 1000000).toFixed(
        1
      )} crore coverage`,
    });
  }

  return recommendations;
}

// Generate AI-powered investment recommendations
async function generateInvestmentRecommendations(salary, age, riskProfile) {
  // Use AI if available, otherwise fallback to static recommendations
  if (process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY) {
    try {
      const prompt = `You are a financial advisor for middle-class salaried people in India. Recommend investment options based on:

User Profile:
- Monthly Salary: ₹${salary.toLocaleString('en-IN')}
- Age: ${age} years
- Risk Profile: ${riskProfile || 'moderate'}

Provide investment recommendations in JSON format:
[
  {
    "type": "sip|fd|ppf|elss|stocks|gold",
    "amount": monthly_investment_amount_in_rupees,
    "frequency": "monthly|yearly",
    "expectedReturns": expected_annual_return_percentage,
    "riskLevel": "low|medium|high",
    "message": "Brief explanation of why this investment suits them (max 100 words)"
  }
]

Guidelines:
- SIP (Mutual Funds): 15-20% of salary, returns based on risk profile (8-12%)
- Emergency Fund (FD/RD): 10% of salary, 6-7% returns, low risk
- PPF: For tax savings, 7-8% returns, low risk
- ELSS: Tax-saving mutual funds, 10-12% returns, medium-high risk
- Gold: 5-10% of portfolio, 8-10% returns, medium risk
- Consider age: Younger = more aggressive, Older = more conservative
- Risk profile: aggressive = 12%+, moderate = 10%, conservative = 8%

Return ONLY valid JSON array, no other text.`;

      const aiResponse = await callAI(prompt, {
        temperature: 0.6,
        maxTokens: 800,
      });

      // Parse AI response
      try {
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const aiRecommendations = JSON.parse(jsonMatch[0]);
          if (
            Array.isArray(aiRecommendations) &&
            aiRecommendations.length > 0
          ) {
            console.log('✅ AI-generated investment recommendations');
            return aiRecommendations;
          }
        }
      } catch (parseError) {
        console.warn(
          'Failed to parse AI investment JSON, using fallback:',
          parseError.message
        );
      }
    } catch (error) {
      console.warn(
        'AI investment recommendation failed, using fallback:',
        error.message
      );
    }
  }

  // Fallback to static recommendations
  return generateStaticInvestmentRecommendations(salary, age, riskProfile);
}

// Fallback static investment recommendations
function generateStaticInvestmentRecommendations(salary, age, riskProfile) {
  const recommendations = [];

  // SIP Recommendation
  const sipAmount = Math.round(salary * 0.15);
  recommendations.push({
    type: 'sip',
    amount: sipAmount,
    frequency: 'monthly',
    expectedReturns:
      riskProfile === 'aggressive' ? 12 : riskProfile === 'moderate' ? 10 : 8,
    riskLevel:
      riskProfile === 'aggressive'
        ? 'high'
        : riskProfile === 'moderate'
        ? 'medium'
        : 'low',
    message: `Monthly SIP of ₹${sipAmount.toLocaleString(
      'en-IN'
    )} in mutual funds`,
  });

  // Emergency Fund (FD)
  const emergencyAmount = Math.round(salary * 0.1);
  recommendations.push({
    type: 'fd',
    amount: emergencyAmount,
    frequency: 'monthly',
    expectedReturns: 6.5,
    riskLevel: 'low',
    message: `Build emergency fund with ₹${emergencyAmount.toLocaleString(
      'en-IN'
    )}/month in FD`,
  });

  return recommendations;
}

module.exports = {
  generateSmartBudget,
  categorizeExpense,
  generateFinancialAdvice,
  generateInsuranceRecommendations,
  generateInvestmentRecommendations,
  callAI, // Export callAI for use in other modules
};
