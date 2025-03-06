import { IGetAuthTokenPayload, IMessageResponse, MessageHandler } from './types';

export const getAuthTokenHandler: MessageHandler<IGetAuthTokenPayload> = async (
  payload
): Promise<IMessageResponse> => {
  try {
    const token = await getAuthToken(payload.interactive || false);
    return {
      success: true,
      token
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

async function getAuthToken(interactive = false): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(token);
    });
  });
} 