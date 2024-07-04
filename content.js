chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'calculateStoryPoints') {
    function getTotalStories(parent, title) {
      let totalText = '';
      const nameSums = {};

      // Iterate over each row in the table
      const rows = parent.querySelectorAll('table tr');
      rows.forEach(row => {
        // Find the second-to-last column and get the <span> element with the name
        const nameElement = row.querySelector('td:nth-last-child(2) span[id$="val-avatar-label"]');
        const name = nameElement ? nameElement.textContent.trim() : '';

        // Find the last column and get its value
        const valueElement = row.querySelector('td:last-child');
        const value = valueElement ? parseFloat(valueElement.textContent.trim()) : NaN;

        // If the name is not empty and value is a number
        if (name && !isNaN(value)) {
          if (nameSums[name]) {
            nameSums[name] += value;
          } else {
            nameSums[name] = value;
          }
        }
      });

      totalText += title + '<br/>';
      // Display the results
      Object.keys(nameSums).forEach(name => {
        totalText += (name + ": " + nameSums[name]) + '<br/>';
      });
      totalText += '<br/>';
      return totalText;
    }

    // find completed
    let totalText = '';
    const completeIssuesContainer = document.querySelector('[data-test-id="software-burndown-report.ui.data-tables.complete-issues-table-container"]');
    const incompleteIssuesContainer = document.querySelector('[data-test-id="software-burndown-report.ui.data-tables.incomplete-issues-table-container"]');

    if (completeIssuesContainer && incompleteIssuesContainer) {
      totalText += getTotalStories(completeIssuesContainer, 'Completed points');
      totalText += getTotalStories(incompleteIssuesContainer, 'Uncompleted Points:');
    } else {
      console.error('Required elements not found.');
      sendResponse({ totalPoints: 'Error: Required elements not found' });
      return;
    }

    sendResponse({ totalText });
  }
});

