import { IMessagePayload, MessageRouter } from './messages';

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  (async () => {
    try {
      // TODO: Add validation
      const response = await MessageRouter.handleMessage(message as IMessagePayload);
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
