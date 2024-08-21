chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'calculateStoryPoints') {
    const statusSum = {
      "Completed points": 0,
      "Incompleted points": 0,
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
      totalText += '<span style="color: darkorange;">' + title + ':</span> ' + totalPoints + '<br/>';
var comparisonTable = '';

// Collect all unique statuses and issues
var uniqueStatuses = new Set();
var uniqueIssues = new Set();
$.each(nameSums, function(name, sum) {
    $.each(sum.status, function(status) {
        uniqueStatuses.add(status);
    });
    $.each(sum.issue, function(issueType) {
        uniqueIssues.add(issueType);
    });
});

// Convert Sets to arrays for easier iteration
uniqueStatuses = Array.from(uniqueStatuses);
uniqueIssues = Array.from(uniqueIssues);

// Start the comparison table with headers
comparisonTable += '<table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse; width: 100%;">';
comparisonTable += '<thead><tr>';
comparisonTable += '<th>Name</th>';
comparisonTable += '<th>Total Points</th>';
          $.each(uniqueStatuses, function(index, status) {
                comparisonTable += '<th data-type="status">Status: ' + status + '</th>';
            });

            $.each(uniqueIssues, function(index, issue) {
                comparisonTable += '<th data-type="issue">Issue: ' + issue + '</th>';
            });
comparisonTable += '</tr></thead>';
comparisonTable += '<tbody>';

// Iterate over each name to generate rows
$.each(nameSums, function(name, sum) {
    var row = '<tr>';
    row += '<td>' + name + '</td>';
    row += '<td>' + sum.total + '</td>';

    // Add points for each status
    $.each(uniqueStatuses, function(index, status) {
        var points = sum.status[status] || 0;
        row += '<td>' + points + '</td>';
    });

    // Add counts for each issue
    $.each(uniqueIssues, function(index, issue) {
        var count = sum.issue[issue] || 0;
        row += '<td>' + count + '</td>';
    });

    row += '</tr>';
    comparisonTable += row;
});

comparisonTable += '</tbody></table><br/>';

// Append the comparison table to totalText or wherever you need it to be displayed
totalText += comparisonTable;


      // Display the results per name
$.each(nameSums, function(name, sum) {
    // Display Name and Total Points outside the table
    totalText += '<div style="font-weight: bold; color: blue;">Name: ' + name + '</div>';
    totalText += '<div style="font-weight: bold; color: darkred;">Total Points: ' + sum.total + '</div>';

    // Create the table for Status and Issue
    totalText += '<table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse; width: 100%;">';
    totalText += '<thead><tr><th>Status</th><th>Points</th></tr></thead>';
    totalText += '<tbody>';

    // Generate rows for each status
    $.each(sum.status, function(status, value) {
        totalText += '<tr>';
        totalText += '<td>' + status + '</td>';
        totalText += '<td>' + value + '</td>';
        totalText += '</tr>';
    });

    // Add an empty row between status and issue sets
    totalText += '<tr><td colspan="2" style="height: 10px;"></td></tr>';

    // Add header for Issue and Count
    totalText += '<tr><th>Issue</th><th>Count</th></tr>';

    // Generate rows for each issue
    $.each(sum.issue, function(issueType, value) {
        totalText += '<tr>';
        totalText += '<td>' + issueType + '</td>';
        totalText += '<td>' + value + '</td>';
        totalText += '</tr>';
    });

    totalText += '</tbody></table><br/>';
});


      return totalText;
    }

    // Find completed and incomplete issues containers
    let totalText = '';
    const $completeIssuesContainer = $('[data-test-id="software-burndown-report.ui.data-tables.complete-issues-table-container"]');
    const $incompleteIssuesContainer = $('[data-test-id="software-burndown-report.ui.data-tables.incomplete-issues-table-container"]');

    if ($completeIssuesContainer.length && $incompleteIssuesContainer.length) {
      totalText += getTotalStories($completeIssuesContainer, 'Completed points');
      totalText += getTotalStories($incompleteIssuesContainer, 'Incompleted points');

      // Display overall status totals
      totalText += '<br/><span style="color: darkorange;">Overall Status Summary:</span><br/>';

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

