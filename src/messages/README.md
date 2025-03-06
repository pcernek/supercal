# Message Handling Architecture

This directory contains the message handling system for the Supercal Chrome extension. The architecture is designed to be modular, testable, and maintainable.

## Overview

The message handling system is built around the following components:

1. **Message Types**: Defined in `types.ts`, these include the message actions and strictly typed payload interfaces.
2. **Message Handlers**: Each handler is a function responsible for processing a specific type of message.
3. **Background Script**: The main entry point that routes messages to the appropriate handlers based on the action.

## Message Flow

1. A component (content script, popup, etc.) sends a message using `chrome.runtime.sendMessage`.
2. The background script receives the message and validates the action.
3. The background script selects the appropriate handler based on the message action.
4. The handler processes the message and sends a response.

## Adding a New Message Type

To add a new message type:

1. Add a new action to the `MessageAction` enum in `types.ts`.
2. Create a new payload interface that extends `IBaseMessagePayload` with the specific action and any additional fields.
3. Add the new payload type to the `MessagePayload` union type.
4. Create a new handler function that implements the `MessageHandler<T>` type.
5. Export the handler from its file and from `index.ts`.
6. Add a new case to the switch statement in `background.ts`.

## Handler Implementation

Each handler should:

1. Check if it can handle the given message action.
2. Process the message and perform any necessary operations.
3. Send a response using the provided `sendResponse` function.
4. Return `true` if the message was handled, `false` otherwise.

## Example

```typescript
import { MessageAction, MessageHandler } from './types';

// Define a new payload type
export interface IMyNewActionPayload extends IBaseMessagePayload {
  action: MessageAction.MyNewAction;
  someData: string;
}

// Add to the MessagePayload union type in types.ts
export type MessagePayload = 
  | IGetAuthTokenPayload
  | IGetCalendarEventsPayload
  | ISignOutPayload
  | IMyNewActionPayload;

// Create the handler
export const myNewActionHandler: MessageHandler<IMyNewActionPayload> = async (
  payload,
  sendResponse
) => {
  if (payload.action !== MessageAction.MyNewAction) {
    return false;
  }

  try {
    // Process the message
    const result = await doSomething(payload.someData);
    
    // Send a response
    sendResponse({
      success: true,
      data: result
    });
  } catch (error) {
    sendResponse({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }

  return true; // Message was handled
};

async function doSomething(data: string) {
  // Implementation
}
``` 