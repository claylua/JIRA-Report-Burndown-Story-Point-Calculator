chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'calculateStoryPoints') {
    const statusSum = {
      "Completed points": 0,
      "Uncompleted points": 0,
      "To Do": 0,
      "DEVELOPMENT": 0,
      "READY FOR TEST": 0,
      "Testing": 0,
      "Rejected": 0,
      "PASSED": 0,
      "Code review": 0,
      "Blocked by pm": 0,
      "Blocked by bug": 0,
      "Obsolete": 0,
      "Done": 0
    };

    function getTotalStories($parent, title) {
      let totalText = '';
      const nameSums = {};
      let totalPoints = 0;
      const statusSums = {};

      // Find sprint number from the heading
      const sprintMatch = $('h2._1wyb1igy._otyrxy5q._2hwx1wug').text().match(/(\d+\.\d+)/);
      const sprint = sprintMatch ? sprintMatch[0] : '';

      // Iterate over each row in the table
      $parent.find('table tr').each(function() {
        // Find the second-to-last column and get the <span> element with the name
        const $nameElement = $(this).find('td:nth-last-child(2) span[id$="val-avatar-label"]');
        const name = $nameElement.length ? $nameElement.text().trim() : '';

        // Find the status
        const $statusElement = $(this).find('td:nth-last-child(3) div[role$="presentation"]');
        const status = $statusElement.length ? $statusElement.text().trim() : '';

        // Find the last column and get its value
        const $valueElement = $(this).find('td:last-child');
        const value = $valueElement.length ? parseFloat($valueElement.text().trim()) : NaN;

        // Find description
        const $descElement = $(this).find('td:nth-child(2)');
        const desc = $descElement.length ? $descElement.text().trim() : '';
        const devbug = desc.includes('[DEV-' + sprint + ']');

        // Find issue type
        const $issueElement = $(this).find('td:nth-child(3)');
        const issue = $issueElement.length ? $issueElement.text().trim() : '';

        // If the name is not empty and value is a number
        if (name) {
          // Initialize if not existing
          if (!nameSums[name]) {
            nameSums[name] = { total: 0, status: {}, issue: {} };
          }

          // Update status total
          if (!nameSums[name].status[status]) {
            nameSums[name].status[status] = 0;
          }

          // Update overall totals
          if (!statusSums[status]) {
            statusSums[status] = 0;
          }

          if (!isNaN(value)) {
            totalPoints += value;
            nameSums[name].total += value;
            statusSums[status] += value;
            statusSum[title] += value;
            statusSum[status] += value;
            nameSums[name].status[status] += value;
          }

          if (!nameSums[name].issue[issue]) {
            nameSums[name].issue[issue] = 1;
          } else {
            nameSums[name].issue[issue]++;
          }

          if (devbug) {
            if (!nameSums[name].issue['devbug']) {
              nameSums[name].issue['devbug'] = 1;
            } else {
              nameSums[name].issue['devbug']++;
            }
          }
        }
      });

      // Add title and total points to the result text
      totalText += '<span style="color: darkred;">' + title + ':</span> ' + totalPoints + '<br/>';

      // Display the results per name
      $.each(nameSums, function(name, sum) {
        totalText += '<span style="color: blue;">' + name + ':</span> ' + sum.total + '<br/>'; // Display total points for the name
        $.each(sum.status, function(status, value) {
          if (status !== 'total') { // Exclude the total key from the status list
            totalText += '&emsp;' + status + ": " + value + '<br/>'; // Indent status breakdown
          }
        });
        totalText += '<br/>';
        $.each(sum.issue, function(issueType, value) {
          if (issueType !== 'total') { // Exclude the total key from the status list
            totalText += '&emsp;' + issueType + ": " + value + '<br/>'; // Indent issue breakdown
          }
        });
      });

      totalText += '<br/>';

      return totalText;
    }

    // Find completed and incomplete issues containers
    let totalText = '';
    const $completeIssuesContainer = $('[data-test-id="software-burndown-report.ui.data-tables.complete-issues-table-container"]');
    const $incompleteIssuesContainer = $('[data-test-id="software-burndown-report.ui.data-tables.incomplete-issues-table-container"]');

    if ($completeIssuesContainer.length && $incompleteIssuesContainer.length) {
      totalText += getTotalStories($completeIssuesContainer, 'Completed points');
      totalText += getTotalStories($incompleteIssuesContainer, 'Uncompleted points');

      // Display overall status totals
      totalText += '<br/><span style="color: darkorange;">Overall Status Totals:</span><br/>';

      // Print dev committed
      const totalDevCommittedPoints = statusSum["Completed points"] + statusSum["READY FOR TEST"] + statusSum["Testing"] - statusSum["Rejected"] - statusSum["Blocked by pm"] - statusSum["Obsolete"];
      totalText += 'Total Dev Committed Points: ' + totalDevCommittedPoints + '<br/>';

      $.each(statusSum, function(status, value) {
        totalText += status + ": " + value + '<br/>';
      });

    } else {
      console.error('Required elements not found.');
      sendResponse({ totalText: '<span style="color: darkred;">Error: Required elements not found</span>' });
      return;
    }

    sendResponse({ totalText: totalText });
  }
});

