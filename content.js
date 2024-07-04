chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		if (request.action === 'calculateStoryPoints') {
		// Ensure jQuery is available
		if (typeof $ !== 'undefined') {
		// Find the th element containing a div with the exact text "QA Story Point Estimate"




		getTotalStories = function($parent, title) {
		let totalText = '';
		var nameSums = {};

		// Iterate over each row in the table
		$parent.find('table tr').each(function() {
				// Find the second-to-last column and get the <span> element with the name
				var name = $(this).find('td:nth-last-child(2) span[id$="val-avatar-label"]').text().trim();

				// Find the last column and get its value
				var value = parseFloat($(this).find('td:last-child').text().trim());

				// If the name is not empty and value is a number
				if (name && !isNaN(value)) {
				if (nameSums[name]) {
				nameSums[name] += value;
				} else {
				nameSums[name] = value;
				}
				}
				});

		totalText += title + '<br/>'
			// Display the results
			$.each(nameSums, function(name, totalSum) {
					totalText += (name + ": " + totalSum) + '<br/>';
					});
		totalText += '<br/>'
		return totalText;
		}

		// find completed
		let totalText = '';
		totalText += getTotalStories($('[data-test-id="software-burndown-report.ui.data-tables.complete-issues-table-container"]'), 'Completed points');
		totalText += getTotalStories($('[data-test-id="software-burndown-report.ui.data-tables.incomplete-issues-table-container"]'), 'Uncompleted Points:');



		sendResponse({ totalText });
		} else {
			console.error('jQuery is not loaded.');
			sendResponse({ totalPoints: 'Error: jQuery not loaded' });
		}
		}
});
