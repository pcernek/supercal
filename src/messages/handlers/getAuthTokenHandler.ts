export interface IGetAuthTokenPayload {
  interactive?: boolean;
}

export interface IGetAuthTokenResponse {
  token?: string;
}

export const getAuthTokenHandler = async (
  payload: IGetAuthTokenPayload
): Promise<IGetAuthTokenResponse> => {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: payload.interactive || false }, (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve({ token });
    });
  });
};
