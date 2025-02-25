// This file is intentionally minimal as the options page is primarily informational.
// Future functionality could include saving user preferences.

document.addEventListener('DOMContentLoaded', () => {
  // Get the extension ID to display to the user
  const extensionId = chrome.runtime.id;
  
  // Find any elements that need to display the extension ID
  const extensionIdElements = document.querySelectorAll('.extension-id');
  extensionIdElements.forEach(element => {
    element.textContent = extensionId;
  });
}); 