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
    const totalIssue = {};

    function getSprint() {
      const sprintMatch = $('h2._1wyb1igy._otyrxy5q._2hwx1wug').text().match(/(\d+\.\d+)/);
      return sprintMatch ? sprintMatch[0] : '';
    }

    function getTotalStories($parent, title) {
      let totalText = '';
      const nameSums = {};
      let totalPoints = 0;
      const statusSums = {};
      const sprint = getSprint();

      $parent.find('table tr').each(function() {
        const name = $(this).find('td:nth-last-child(2) span[id$="val-avatar-label"]').text().trim();
        const status = $(this).find('td:nth-last-child(3) div[role$="presentation"]').text().trim();
        const value = parseFloat($(this).find('td:last-child').text().trim()) || 0;
        const desc = $(this).find('td:nth-child(2)').text().trim();
        const devbug = desc.includes('[DEV-' + sprint + ']');
        const issue = $(this).find('td:nth-child(3)').text().trim();

        if (name) {
          if (!nameSums[name]) {
            nameSums[name] = { total: 0, status: {}, issue: {} };
          }

          if (!nameSums[name].status[status]) {
            nameSums[name].status[status] = 0;
          }

          if (!statusSums[status]) {
            statusSums[status] = 0;
          }

          totalPoints += value;
          nameSums[name].total += value;
          statusSums[status] += value;
          statusSum[title] += value;
          statusSum[status] += value;
          nameSums[name].status[status] += value;

          if (!totalIssue[issue]) {
            totalIssue[issue] = 1;
          } else {
            totalIssue[issue]++;
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

      totalText += `<span style="color: darkorange;">${title}:</span> ${totalPoints}<br/>`;
      totalText += generateComparisonTable(nameSums);
      totalText += generateDetailedTables(nameSums);

      return totalText;
    }

    function generateComparisonTable(nameSums) {
      let comparisonTable = '';
      const uniqueStatuses = new Set();
      const uniqueIssues = new Set();

      $.each(nameSums, function(name, sum) {
        $.each(sum.status, function(status) {
          uniqueStatuses.add(status);
        });
        $.each(sum.issue, function(issueType) {
          uniqueIssues.add(issueType);
        });
      });

      comparisonTable += '<table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse; width: 100%;">';
      comparisonTable += '<thead><tr><th>Name</th><th>Total Points</th>';

      $.each(Array.from(uniqueStatuses), function(index, status) {
        comparisonTable += `<th data-type="status">Status: ${status}</th>`;
      });

      $.each(Array.from(uniqueIssues), function(index, issue) {
        comparisonTable += `<th data-type="issue">Issue: ${issue}</th>`;
      });

      comparisonTable += '</tr></thead><tbody>';

      $.each(nameSums, function(name, sum) {
        let row = `<tr><td>${name}</td><td>${sum.total}</td>`;

        $.each(Array.from(uniqueStatuses), function(index, status) {
          const points = sum.status[status] || 0;
          row += `<td>${points}</td>`;
        });

        $.each(Array.from(uniqueIssues), function(index, issue) {
          const count = sum.issue[issue] || 0;
          row += `<td>${count}</td>`;
        });

        row += '</tr>';
        comparisonTable += row;
      });

      comparisonTable += '</tbody></table><br/>';
      return comparisonTable;
    }

    function generateDetailedTables(nameSums) {
      let detailedTables = '';

      $.each(nameSums, function(name, sum) {
        detailedTables += `<div style="font-weight: bold; color: blue;">Name: ${name}</div>`;
        detailedTables += `<div style="font-weight: bold; color: darkred;">Total Points: ${sum.total}</div>`;

        detailedTables += '<table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse; width: 100%;">';
        detailedTables += '<thead><tr><th>Status</th><th>Points</th></tr></thead><tbody>';

        $.each(sum.status, function(status, value) {
          detailedTables += `<tr><td>${status}</td><td>${value}</td></tr>`;
        });

        detailedTables += '<tr><td colspan="2" style="height: 10px;"></td></tr>';
        detailedTables += '<tr><th>Issue</th><th>Count</th></tr>';

        $.each(sum.issue, function(issueType, value) {
          detailedTables += `<tr><td>${issueType}</td><td>${value}</td></tr>`;
        });

        detailedTables += '</tbody></table><br/>';
      });

      return detailedTables;
    }

    function generateStatusSummary() {
      let tableHtml = `
        <style>
          table {
            border-collapse: collapse;
            width: 100%;
            font-family: Arial, sans-serif;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
            color: #333;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          tr:hover {
            background-color: #f1f1f1;
          }
          .total-row {
            font-weight: bold;
            background-color: #e6e6e6;
          }
        </style>
        <table>
          <tr>
            <th>Status</th>
            <th>Points</th>
          </tr>`;

      $.each(statusSum, function(status, value) {
        tableHtml += `
          <tr>
            <td>${status}</td>
            <td>${value}</td>
          </tr>`;
      });

      const totalDevCommittedPoints = statusSum["Completed points"] + statusSum["READY FOR TEST"] + statusSum["Testing"] - statusSum["Rejected"] - statusSum["Blocked by pm"] - statusSum["Obsolete"];
      tableHtml += `
        <tr class="total-row">
          <td>Total Dev Committed Points</td>
          <td>${totalDevCommittedPoints}</td>
        </tr>
      </table>`;

      return tableHtml;
    }

    function generateIssueSummary() {
      let issueSummaryHtml = `
        <style>
          table {
            border-collapse: collapse;
            width: 100%;
            font-family: Arial, sans-serif;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
            color: #333;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          tr:hover {
            background-color: #f1f1f1;
          }
        </style>
        <br/><span style="color: darkorange;">Overall Issue Type Summary:</span><br/>
        <table>
          <tr>
            <th>Issue Type</th>
            <th>Count</th>
          </tr>`;

      $.each(totalIssue, function(issueType, count) {
        issueSummaryHtml += `
          <tr>
            <td>${issueType}</td>
            <td>${count}</td>
          </tr>`;
      });

      issueSummaryHtml += '</table>';
      return issueSummaryHtml;
    }

    let totalText = '';
    const $completeIssuesContainer = $('[data-test-id="software-burndown-report.ui.data-tables.complete-issues-table-container"]');
    const $incompleteIssuesContainer = $('[data-test-id="software-burndown-report.ui.data-tables.incomplete-issues-table-container"]');

    if ($completeIssuesContainer.length && $incompleteIssuesContainer.length) {
      totalText += getTotalStories($completeIssuesContainer, 'Completed points');
      totalText += getTotalStories($incompleteIssuesContainer, 'Incompleted points');
      totalText += '<br/><span style="color: darkorange;">Overall Status Summary:</span><br/>';
      totalText += generateStatusSummary();
      totalText += generateIssueSummary();
    } else {
      console.error('Required elements not found.');
      sendResponse({ totalText: '<span style="color: darkred;">Error: Required elements not found</span>' });
      return;
    }

    sendResponse({ totalText: totalText });
  }
});

