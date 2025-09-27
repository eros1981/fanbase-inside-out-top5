/**
 * Parses the /insideout command arguments
 * @param text - Raw command text from Slack
 * @returns Parsed arguments with month, year, and category
 */
export function parseCommandArgs(text: string): { month: string; year: string; category: string | null } {
  const args = text.trim().split(/\s+/);
  
  // Default to last month if no arguments provided
  if (args.length === 0 || (args.length === 1 && args[0] === '')) {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return {
      month: (lastMonth.getMonth() + 1).toString(),
      year: lastMonth.getFullYear().toString(),
      category: 'all'
    };
  }

  let month: string;
  let year: string;
  let category: string | null = null;

  // Handle "top5" prefix - skip it if present
  let startIndex = 0;
  if (args[0].toLowerCase() === 'top5') {
    startIndex = 1;
  }

  // Parse month and year
  if (args.length >= startIndex + 2) {
    const monthArg = args[startIndex].toLowerCase();
    const yearArg = args[startIndex + 1];

    // Handle month parsing
    if (monthArg === 'last-month' || monthArg === 'last') {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      month = (lastMonth.getMonth() + 1).toString();
      year = lastMonth.getFullYear().toString();
    } else if (/^\d{4}-\d{2}$/.test(monthArg)) {
      // Handle YYYY-MM format
      const [yearPart, monthPart] = monthArg.split('-');
      year = yearPart;
      month = monthPart;
    } else {
      // Handle month name (jan, feb, mar, etc.)
      const monthMap: { [key: string]: string } = {
        'jan': '01', 'january': '01',
        'feb': '02', 'february': '02',
        'mar': '03', 'march': '03',
        'apr': '04', 'april': '04',
        'may': '05',
        'jun': '06', 'june': '06',
        'jul': '07', 'july': '07',
        'aug': '08', 'august': '08',
        'sep': '09', 'september': '09',
        'oct': '10', 'october': '10',
        'nov': '11', 'november': '11',
        'dec': '12', 'december': '12'
      };

      month = monthMap[monthArg] || monthArg;
      year = yearArg;
    }

    // Parse category if provided
    if (args.length >= startIndex + 3) {
      category = args[startIndex + 2].toLowerCase();
    }
  } else {
    // Fallback to current month if only one argument
    const now = new Date();
    month = (now.getMonth() + 1).toString();
    year = now.getFullYear().toString();
  }

  return { month, year, category };
}
