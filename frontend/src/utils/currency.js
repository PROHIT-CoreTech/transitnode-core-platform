/**
 * Format a number as Indian Rupee currency.
 * Uses en-IN locale so commas follow the Indian lakh/crore system:
 *   1000      → 1,000
 *   100000    → 1,00,000  (1 lakh)
 *   1678497   → 16,78,497
 *   10000000  → 1,00,00,000 (1 crore)
 *
 * @param {number|string} value - The numeric value to format
 * @param {number} decimals - Decimal places (default 0 for whole rupees)
 * @returns {string} Formatted Indian number string (without ₹ symbol)
 */
export const formatINR = (value, decimals = 0) => {
  const num = parseFloat(value);
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format a number as Indian Rupee with ₹ symbol.
 * @param {number|string} value
 * @param {number} decimals
 * @returns {string} e.g. "₹16,78,497"
 */
export const formatINRWithSymbol = (value, decimals = 0) => {
  return `₹${formatINR(value, decimals)}`;
};
