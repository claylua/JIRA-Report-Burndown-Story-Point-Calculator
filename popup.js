document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.scripting.executeScript({
      target: {tabId: tabs[0].id},
      files: ['content.js']
    }, () => {
      chrome.tabs.sendMessage(tabs[0].id, {action: "calculateStoryPoints"}, function(response) {
        document.getElementById('total-points').innerHTML = response.totalText;
      });
    });
  });
});
