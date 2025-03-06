import { MessagePayload, MessageRouter } from './messages';

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((message: MessagePayload, _sender, sendResponse) => {
  (async () => {
    try {
      const response = await MessageRouter.handleMessage(message);
      sendResponse(response);
    } catch (error) {
      console.error('Error in message handler:', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  })();

  // Return true to indicate we will respond asynchronously
  return true;
});
