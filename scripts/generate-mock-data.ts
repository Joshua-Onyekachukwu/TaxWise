import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';

// Nigerian Context Data
const INCOME_SOURCES = [
  { name: 'Upwork Inc.', amount: [300000, 800000], freq: 'weekly' },
  { name: 'Paystack Transfer: Client Payment', amount: [150000, 500000], freq: 'monthly' },
  { name: 'Salary: TechCo Nigeria Ltd', amount: [850000, 850000], freq: 'monthly' },
  { name: 'Freelance: Consult', amount: [50000, 200000], freq: 'random' }
];

const EXPENSES = [
  // Deductible (Business)
  { name: 'Spectranet 4G LTE', amount: [20000, 35000], category: 'Internet', deductible: true },
  { name: 'MainOne Cable', amount: [45000, 45000], category: 'Internet', deductible: true },
  { name: 'Uber Ride', amount: [1500, 6000], category: 'Transport', deductible: true },
  { name: 'Bolt Trip', amount: [1200, 4500], category: 'Transport', deductible: true },
  { name: 'Vercel Inc.', amount: [25000, 25000], category: 'Software', deductible: true },
  { name: 'Zoom Video Comms', amount: [18000, 18000], category: 'Software', deductible: true },
  { name: 'Coworking Space Lekki', amount: [60000, 60000], category: 'Rent', deductible: true },
  
  // Personal
  { name: 'Shoprite Lekki', amount: [15000, 80000], category: 'Groceries', deductible: false },
  { name: 'Spar Nigeria', amount: [10000, 50000], category: 'Groceries', deductible: false },
  { name: 'Netflix Subscription', amount: [4500, 4500], category: 'Entertainment', deductible: false },
  { name: 'DSTV Premium', amount: [29500, 29500], category: 'Entertainment', deductible: false },
  { name: 'Dominos Pizza', amount: [8000, 25000], category: 'Dining', deductible: false },
  { name: 'Eko Hotels & Suites', amount: [45000, 150000], category: 'Dining', deductible: false },
  { name: 'Fuel - Total', amount: [10000, 25000], category: 'Transport', deductible: false }, // Personal car fuel
  { name: 'GTBank Trf: Mom', amount: [20000, 50000], category: 'Family', deductible: false },
];

function generateDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateCSV() {
  const transactions: string[] = ['Date,Description,Amount,Type'];
  
  // Generate for 18 months (Jan 2023 - June 2024)
  const startDate = new Date('2023-01-01');
  const endDate = new Date('2024-06-30');
  
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    
    // 1. Monthly Recurring (Salary, Rent, Subscriptions)
    INCOME_SOURCES.forEach(src => {
        if (src.freq === 'monthly') {
            const date = new Date(year, month, 25); // Payday
            if (date <= endDate && date >= startDate) {
                const amt = faker.number.int({ min: src.amount[0], max: src.amount[1] });
                transactions.push(`${date.toISOString().split('T')[0]},"${src.name}",${amt},income`);
            }
        }
    });

    // 2. Weekly Recurring (Freelance Payouts)
    if (currentDate.getDay() === 3) { // Wednesdays
         const src = INCOME_SOURCES[0]; // Upwork
         const amt = faker.number.int({ min: src.amount[0], max: src.amount[1] });
         transactions.push(`${currentDate.toISOString().split('T')[0]},"${src.name}",${amt},income`);
    }

    // 3. Random Daily Transactions (Expenses)
    // Generate 1-3 transactions per day
    const dailyTxCount = faker.number.int({ min: 0, max: 3 });
    for (let i = 0; i < dailyTxCount; i++) {
        const expense = faker.helpers.arrayElement(EXPENSES);
        const amt = faker.number.int({ min: expense.amount[0], max: expense.amount[1] });
        // In CSV, expenses are typically negative
        transactions.push(`${currentDate.toISOString().split('T')[0]},"${expense.name}",-${amt},expense`);
    }

    // Next Day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Write File
  const content = transactions.join('\n');
  const filePath = path.join(process.cwd(), 'public', 'sample-data', 'nigeria_tech_full_history.csv');
  
  // Ensure dir exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(filePath, content);
  console.log(`Generated ${transactions.length} transactions at ${filePath}`);
}

generateCSV();
