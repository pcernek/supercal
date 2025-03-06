import { IMessageResponse, ISignOutPayload, MessageHandler } from './types';

export const signOutHandler: MessageHandler<ISignOutPayload> = async (
): Promise<IMessageResponse> => {
  try {
    const token = await getAuthToken();
    await revokeToken(token);
    await clearAllCachedAuthTokens();

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

async function getAuthToken(): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(token);
    });
  });
}

async function revokeToken(token: string | undefined) {
  if (!token) {
    console.error('No token to revoke');
    return;
  }

  try {
    await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  } catch (error) {
    console.error('Error revoking token:', error);
    throw error;
  }
}

// Helper to promisify chrome.identity.clearAllCachedAuthTokens
function clearAllCachedAuthTokens(): Promise<void> {
  return new Promise((resolve) => {
    chrome.identity.clearAllCachedAuthTokens(resolve);
  });
} 