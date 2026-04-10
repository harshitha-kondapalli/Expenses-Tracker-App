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