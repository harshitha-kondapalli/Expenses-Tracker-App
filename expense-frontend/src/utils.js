export const parseSmartInput = (inputText) => {
  const lowerInput = inputText.toLowerCase();

  // 1. Extract the Amount (Finds the first number in the text)
  const amountMatch = lowerInput.match(/\d+(\.\d+)?/);
  const amount = amountMatch ? amountMatch[0] : '';

  // 2. Define our Smart Keywords
  const categoryKeywords = {
    'Food': ['tiffin', 'breakfast', 'lunch', 'dinner', 'coffee', 'chai', 'zomato', 'swiggy', 'grocery', 'darshan'],
    'Travel': ['uber', 'ola', 'auto', 'metro', 'bus', 'train', 'petrol', 'cab'],
    'Shopping': ['amazon', 'flipkart', 'myntra', 'clothes', 'shoes', 'mall'],
    'Bills': ['wifi', 'electricity', 'recharge', 'phone', 'water']
  };

  // 3. Find the Category
  let category = 'Others'; // Default fallback
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerInput.includes(keyword))) {
      category = cat;
      break; 
    }
  }

  // 4. Clean up the Title (Remove the amount from the text)
  let title = inputText.replace(amount, '').trim();
  
  // Capitalize the first letter of the title for a cleaner look
  if (title) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  return { amount, category, title };
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const getTransactionDateParts = (value) => {
  if (!value || typeof value !== 'string') return null;

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (!year || !month || !day) return null;

  return { year, month, day };
};

export const isTransactionInMonth = (value, month, year) => {
  const parts = getTransactionDateParts(value);
  if (!parts) return false;

  return parts.month === Number(month) && parts.year === Number(year);
};

export const formatStoredDate = (value, options = {}) => {
  const parts = getTransactionDateParts(value);
  if (!parts) return '';

  const { day = true, month = 'short', year = true } = options;
  const formatted = [];

  if (day) formatted.push(String(parts.day));
  if (month) formatted.push(month === 'numeric' ? String(parts.month).padStart(2, '0') : MONTH_NAMES[parts.month - 1]);
  if (year) formatted.push(String(parts.year));

  return formatted.join(' ');
};