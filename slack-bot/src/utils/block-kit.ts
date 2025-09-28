/**
 * Formats the top 5 data into Slack Block Kit format
 * @param data - Response data from query service
 * @param requestedCategory - The category that was requested (or 'all')
 * @returns Block Kit blocks for Slack
 */
export function formatTop5Response(data: any, requestedCategory: string): any[] {
  const { period, results, notes, lastUpdated } = data;
  
  // Format period for display (e.g., "2025-08" -> "August 2025")
  const [year, month] = period.split('-');
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const displayPeriod = `${monthNames[parseInt(month) - 1]} ${year}`;

  const blocks: any[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `🏆 Top 5 Performers – ${displayPeriod}`
      }
    },
    {
      type: 'divider'
    }
  ];

  // Category configurations with emojis and display names
  const categories = [
    { key: 'monetizer', emoji: '💰', name: 'Monetizer' },
    { key: 'content_machine', emoji: '📸', name: 'Content Machine' },
    { key: 'eyeball_emperor', emoji: '👀', name: 'Eyeball Emperor' },
    { key: 'host_with_the_most', emoji: '🎤', name: 'Host With The Most' },
    { key: 'product_whisperer', emoji: '🧠', name: 'Product Whisperer' }
  ];

  // Filter categories based on request
  const categoriesToShow = requestedCategory === 'all' 
    ? categories 
    : categories.filter(cat => cat.key === requestedCategory);

  categoriesToShow.forEach(category => {
    const categoryData = results[category.key];
    
    if (!categoryData || categoryData.length === 0) {
      // No data for this category
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${category.emoji} ${category.name}*\n_No data available for this period_`
        }
      });
    } else {
      // Special handling for Product Whisperer
      if (category.key === 'product_whisperer') {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${category.emoji} ${category.name}*\n${categoryData[0].user}`
          }
        });
      } else {
        // Format the top 5 list for other categories
        const top5List = categoryData.map((item: any, index: number) => {
          const rank = item.rank || (index + 1);
          const value = formatValue(item.value, item.unit);
          return `${rank}. *${item.user}* - ${value}`;
        }).join('\n');

        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${category.emoji} ${category.name}*\n${top5List}`
          }
        });
      }
    }

    // Add divider between categories (except for the last one)
    if (category !== categoriesToShow[categoriesToShow.length - 1]) {
      blocks.push({ type: 'divider' });
    }
  });

  // Add context footer with last updated timestamp
  const contextText = lastUpdated && lastUpdated !== 'Unknown' 
    ? `📊 Data as of ${new Date().toLocaleDateString()} | Last updated: ${lastUpdated} | ${notes ? notes.join(' ') : 'Ties share the same rank'}`
    : `📊 Data as of ${new Date().toLocaleDateString()} | ${notes ? notes.join(' ') : 'Ties share the same rank'}`;
    
  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: contextText
      }
    ]
  });

  return blocks;
}

/**
 * Formats a value with its unit for display
 * @param value - The numeric value
 * @param unit - The unit (USD, points, etc.)
 * @returns Formatted string
 */
function formatValue(value: number, unit: string): string {
  if (unit === 'USD') {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (unit === 'points' || unit === 'count') {
    return `${value.toLocaleString('en-US')} ${unit}`;
  } else {
    return `${value.toLocaleString('en-US')} ${unit}`;
  }
}
