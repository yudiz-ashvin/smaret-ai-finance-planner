const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const BankStatement = require('../models/BankStatement');
const Expense = require('../models/Expense');
const { categorizeExpense, callAI } = require('../services/aiService');
const pdfParse = require('pdf-parse');
const csv = require('csv-parser');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|csv|jpg|jpeg|png/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, CSV, and image files are allowed'));
    }
  },
});

// Upload and process bank statement
router.post('/upload', auth, upload.single('statement'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileExt = path.extname(req.file.originalname).toLowerCase();
    const fileType =
      fileExt === '.pdf' ? 'pdf' : fileExt === '.csv' ? 'csv' : 'image';

    // Create bank statement record
    const statement = await BankStatement.create({
      userId: req.userId,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType,
      status: 'processing',
    });

    // Process file asynchronously
    processStatement(req.userId, statement._id, req.file.path, fileType).catch(
      (err) => console.error('Error processing statement:', err)
    );

    res.status(201).json({
      message: 'Statement uploaded successfully. Processing...',
      statement: {
        id: statement._id,
        fileName: statement.fileName,
        status: statement.status,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error uploading statement', error: error.message });
  }
});

// Process bank statement
async function processStatement(userId, statementId, filePath, fileType) {
  try {
    const statement = await BankStatement.findById(statementId);
    console.log('Very Bad 🚀 ~ processStatement ~ statement:', statement);
    if (!statement) return;

    let extractedData = [];

    if (fileType === 'pdf') {
      try {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        console.log('📄 PDF parsed, text length:', pdfData.text?.length || 0);

        if (!pdfData.text || pdfData.text.trim().length === 0) {
          console.error('❌ PDF text is empty');
          throw new Error('PDF text extraction failed - empty text');
        }

        // Use AI to extract transactions from PDF text
        extractedData = await extractTransactionsWithAI(pdfData.text);
        console.log(
          '✅ Extracted transactions count:',
          extractedData?.length || 0
        );
      } catch (pdfError) {
        console.error('❌ PDF processing error:', pdfError.message);
        throw pdfError;
      }
    } else if (fileType === 'csv') {
      extractedData = await parseCSV(filePath);
      console.log('✅ CSV parsed, transactions:', extractedData?.length || 0);
    } else {
      // For images, you would use OCR (Tesseract.js or cloud OCR service)
      // For now, return empty
      extractedData = [];
      console.warn('⚠️ Image file type not yet supported');
    }

    // Validate extracted data
    if (!extractedData || extractedData.length === 0) {
      console.warn('⚠️ No transactions extracted from statement');
      statement.status = 'failed';
      statement.error = 'No transactions found in statement';
      await statement.save();
      return { statement, expenses: [] };
    }

    console.log(`📊 Processing ${extractedData.length} transactions`);

    // Categorize expenses using AI
    for (let transaction of extractedData) {
      if (transaction.type === 'debit') {
        try {
          transaction.category = await categorizeExpense(
            transaction.description,
            transaction.amount
          );
        } catch (catError) {
          console.warn(
            '⚠️ Categorization failed for transaction:',
            catError.message
          );
          transaction.category = 'other';
        }
      }
    }

    // Save expenses
    const expenses = [];
    for (let transaction of extractedData) {
      if (transaction.type === 'debit' && transaction.category) {
        const expense = await Expense.create({
          userId,
          category: transaction.category,
          amount: transaction.amount,
          description: transaction.description,
          date: transaction.date,
          source: 'bank_statement',
          statementId,
        });
        expenses.push(expense);
      }
    }

    // Update statement
    const totalDebits = extractedData
      .filter((t) => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalCredits = extractedData
      .filter((t) => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);

    statement.extractedData = extractedData;
    statement.totalDebits = totalDebits;
    statement.totalCredits = totalCredits;
    statement.status = 'completed';
    statement.processedAt = new Date();

    console.log('Statement saved:', statement);
    await statement.save();

    console.log('Statement processed:', { statement, expenses });
    return { statement, expenses };
  } catch (error) {
    const statement = await BankStatement.findById(statementId);
    if (statement) {
      statement.status = 'failed';
      await statement.save();
    }
    throw error;
  }
}

// Extract transactions using AI
async function extractTransactionsWithAI(text) {
  console.log('🔍 Extracting transactions from text, length:', text.length);

  if (!text || text.trim().length === 0) {
    console.warn('⚠️ Empty text provided for extraction');
    return [];
  }

  // Use AI if available, otherwise fallback to basic extraction
  if (process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY) {
    try {
      // Use more text if available (up to 50000 chars for better context)
      const textToProcess =
        text.length > 50000
          ? text.substring(0, 50000) + '...(truncated)'
          : text;

      const prompt = `You are a bank statement parser. Extract all transactions from this bank statement text.

Bank Statement Text:
${textToProcess}

Extract all transactions and return them in JSON format:
[
  {
    "date": "DD-MM-YYYY or YYYY-MM-DD format",
    "description": "Transaction description/merchant name",
    "amount": transaction_amount_as_number,
    "type": "debit" or "credit" (DR = debit, CR = credit, withdrawal = debit, deposit = credit)
  }
]

Guidelines:
- Extract ALL transactions from the statement
- Date format: Use DD-MM-YYYY or YYYY-MM-DD
- Amount: Extract as number (remove commas, currency symbols)
- Type: "debit" for DR/withdrawal/outgoing, "credit" for CR/deposit/incoming
- Description: Clean merchant name or transaction description
- Ignore header/footer text, only extract actual transactions
- If date is not clear, use the statement period dates

Return ONLY valid JSON array, no other text.`;

      console.log('🤖 Calling AI for transaction extraction...');
      const aiResponse = await callAI(prompt, {
        temperature: 0.3,
        maxTokens: 4000, // Increased for more transactions
      });

      console.log('📥 AI Response received, length:', aiResponse?.length || 0);

      // Parse AI response
      try {
        // Try to find JSON array in response
        let jsonMatch = aiResponse.match(/\[[\s\S]*\]/);

        // If no array found, try to find JSON object and wrap it
        if (!jsonMatch) {
          const objMatch = aiResponse.match(/\{[\s\S]*\}/);
          if (objMatch) {
            try {
              const obj = JSON.parse(objMatch[0]);
              if (obj.transactions && Array.isArray(obj.transactions)) {
                jsonMatch = [JSON.stringify(obj.transactions)];
              }
            } catch (e) {
              // Ignore
            }
          }
        }

        if (jsonMatch) {
          const aiTransactions = JSON.parse(jsonMatch[0]);
          console.log(
            '📊 Parsed transactions count:',
            aiTransactions?.length || 0
          );

          if (Array.isArray(aiTransactions) && aiTransactions.length > 0) {
            // Normalize transactions
            const normalizedTransactions = aiTransactions
              .map((t) => {
                // Parse date
                let date = new Date();
                if (t.date) {
                  // Try DD-MM-YYYY format
                  const dateMatch = t.date.match(/(\d{2})-(\d{2})-(\d{4})/);
                  if (dateMatch) {
                    date = new Date(
                      parseInt(dateMatch[3]),
                      parseInt(dateMatch[2]) - 1,
                      parseInt(dateMatch[1])
                    );
                  } else {
                    // Try YYYY-MM-DD format
                    const dateObj = new Date(t.date);
                    if (!isNaN(dateObj.getTime())) {
                      date = dateObj;
                    }
                  }
                }

                return {
                  date,
                  description: (t.description || '').trim(),
                  amount: Math.abs(parseFloat(t.amount) || 0),
                  type: (t.type || 'debit').toLowerCase(),
                  confidence: 0.9, // High confidence for AI extraction
                };
              })
              .filter((t) => t.amount > 0 && t.description.length > 0); // Filter invalid transactions

            console.log(
              `✅ AI extracted ${normalizedTransactions.length} valid transactions`
            );
            return normalizedTransactions;
          } else {
            console.warn('⚠️ AI returned empty array');
          }
        } else {
          console.warn('⚠️ No JSON array found in AI response');
          console.log('AI Response preview:', aiResponse.substring(0, 500));
        }
      } catch (parseError) {
        console.error(
          '❌ Failed to parse AI transactions JSON:',
          parseError.message
        );
        console.log('AI Response that failed:', aiResponse.substring(0, 1000));
      }
    } catch (error) {
      console.error('❌ AI transaction extraction failed:', error.message);
      console.error('Error stack:', error.stack);
    }
  } else {
    console.log('ℹ️ No AI API key found, using fallback extraction');
  }

  // Fallback to basic extraction
  console.log('🔄 Using fallback extraction method');
  const fallbackResults = extractTransactionsFromText(text);
  console.log(`📊 Fallback extracted ${fallbackResults.length} transactions`);
  return fallbackResults;
}

// Fallback: Simple text extraction (improved implementation)
function extractTransactionsFromText(text) {
  const transactions = [];
  if (!text || text.trim().length === 0) {
    return transactions;
  }

  const lines = text.split('\n');

  // Pattern for date: DD-MM-YYYY or DD/MM/YYYY
  const datePattern = /(\d{2})[-/](\d{2})[-/](\d{4})/;
  // Pattern for amount: numbers with commas and decimals (more flexible)
  const amountPattern = /(\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?)/g;
  // Pattern for type: DR or CR
  const typePattern = /\b(DR|CR|DEBIT|CREDIT)\b/i;

  let currentDate = null;
  let statementStartDate = null;
  let statementEndDate = null;

  // Try to find statement period dates
  const periodMatch = text.match(
    /From\s+(\d{2})[-/](\d{2})[-/](\d{4})\s+To\s+(\d{2})[-/](\d{2})[-/](\d{4})/i
  );
  if (periodMatch) {
    statementStartDate = new Date(
      parseInt(periodMatch[3]),
      parseInt(periodMatch[2]) - 1,
      parseInt(periodMatch[1])
    );
    statementEndDate = new Date(
      parseInt(periodMatch[6]),
      parseInt(periodMatch[5]) - 1,
      parseInt(periodMatch[4])
    );
  }

  lines.forEach((line, index) => {
    // Extract date
    const dateMatch = line.match(datePattern);
    if (dateMatch) {
      currentDate = new Date(
        parseInt(dateMatch[3]),
        parseInt(dateMatch[2]) - 1,
        parseInt(dateMatch[1])
      );
    }

    // Extract amount (find all matches and use the largest one, likely the transaction amount)
    const amountMatches = line.match(amountPattern);
    if (amountMatches && (currentDate || statementStartDate)) {
      // Use the largest amount found (usually the transaction amount)
      const amounts = amountMatches.map((m) => parseFloat(m.replace(/,/g, '')));
      const maxAmount = Math.max(...amounts);

      if (maxAmount > 0 && maxAmount < 10000000) {
        // Reasonable amount range
        const typeMatch = line.match(typePattern);
        const type = typeMatch
          ? typeMatch[1].toLowerCase().includes('cr') ||
            typeMatch[1].toLowerCase().includes('credit')
            ? 'credit'
            : 'debit'
          : 'debit';

        // Extract description (remove date, amount, type from line)
        let description = line
          .replace(datePattern, '')
          .replace(/\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?/g, '') // Remove all amounts
          .replace(typePattern, '')
          .replace(/UPI|PAYTM|BANK|ICICI|HDFC|SBI|AXIS|YES BANK/gi, '') // Remove common bank keywords
          .trim()
          .substring(0, 150);

        // Clean description further
        description = description
          .replace(/\s+/g, ' ') // Multiple spaces to single
          .replace(/^\W+|\W+$/g, '') // Remove leading/trailing non-word chars
          .trim();

        if (description.length > 3) {
          transactions.push({
            date: currentDate || statementStartDate || new Date(),
            description,
            amount: maxAmount,
            type,
            confidence: currentDate ? 0.7 : 0.5, // Lower confidence if date inferred
          });
        }
      }
    }
  });

  // Remove duplicates (same date, amount, description)
  const uniqueTransactions = [];
  const seen = new Set();
  transactions.forEach((t) => {
    const key = `${t.date.toISOString()}_${t.amount}_${t.description.substring(
      0,
      30
    )}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueTransactions.push(t);
    }
  });

  return uniqueTransactions;
}

// Parse CSV file
function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const transactions = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Adjust column names based on your CSV format
        const date = row.date || row.Date || row.DATE || new Date();
        const description =
          row.description ||
          row.Description ||
          row.DESCRIPTION ||
          row.narrative ||
          '';
        const amount = parseFloat(
          (
            row.amount ||
            row.Amount ||
            row.AMOUNT ||
            row.debit ||
            row.Debit ||
            '0'
          )
            .toString()
            .replace(/,/g, '')
        );
        const type = (
          row.type ||
          row.Type ||
          row.TYPE ||
          (amount < 0 ? 'credit' : 'debit')
        ).toLowerCase();

        if (amount > 0) {
          transactions.push({
            date: new Date(date),
            description,
            amount: Math.abs(amount),
            type:
              type.includes('credit') || type.includes('cr')
                ? 'credit'
                : 'debit',
            confidence: 0.8,
          });
        }
      })
      .on('end', () => resolve(transactions))
      .on('error', reject);
  });
}

// Get all statements
router.get('/', auth, async (req, res) => {
  try {
    const statements = await BankStatement.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select('-extractedData'); // Don't send full extracted data in list

    res.json({ statements });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching statements', error: error.message });
  }
});

// Get statement details
router.get('/:id', auth, async (req, res) => {
  try {
    const statement = await BankStatement.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!statement) {
      return res.status(404).json({ message: 'Statement not found' });
    }

    // Get expenses from this statement
    const expenses = await Expense.find({ statementId: statement._id });

    res.json({ statement, expenses });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching statement', error: error.message });
  }
});

module.exports = router;
