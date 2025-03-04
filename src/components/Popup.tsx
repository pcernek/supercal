import React, { useEffect, useState } from 'react';
import { IChromeResponse } from '../types';

interface IPopupProps {
  onAuthStatusChange: (status: 'authenticated' | 'unauthenticated') => void;
}

export const Popup: React.FC<IPopupProps> = ({ onAuthStatusChange }) => {
  const [authStatus, setAuthStatus] = useState<string>('Checking authentication status...');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    chrome.runtime.sendMessage({ action: 'getAuthToken', interactive: false }, (response: IChromeResponse) => {
      if (chrome.runtime.lastError || !response || !response.success) {
        setAuthStatus('You need to sign in to access your Google Calendar data.');
        setIsAuthenticated(false);
        onAuthStatusChange('unauthenticated');
      } else {
        setAuthStatus('You are signed in to Google Calendar.');
        setIsAuthenticated(true);
        onAuthStatusChange('authenticated');
      }
    });
  };

  const authenticate = () => {
    setAuthStatus('Signing in...');
    setIsAuthenticated(false);

    chrome.runtime.sendMessage({ action: 'getAuthToken', interactive: true }, (response: IChromeResponse) => {
      if (chrome.runtime.lastError || !response || !response.success) {
        setAuthStatus('Authentication failed. Please try again.');
        setIsAuthenticated(false);
        onAuthStatusChange('unauthenticated');
      } else {
        setAuthStatus('Successfully signed in!');
        setIsAuthenticated(true);
        onAuthStatusChange('authenticated');

        // Notify content script that authentication was successful
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0] && tabs[0].url?.includes('calendar.google.com')) {
            chrome.tabs.sendMessage(tabs[0].id!, {
              action: 'authStatusChanged',
              status: 'authenticated'
            });
          }
        });
      }
    });
  };

  const signOut = () => {
    setAuthStatus('Signing out...');
    setIsAuthenticated(false);

    chrome.runtime.sendMessage({ action: 'signOut' }, (response: IChromeResponse) => {
      if (response && response.success) {
        setAuthStatus('You have been signed out.');
        setIsAuthenticated(false);
        onAuthStatusChange('unauthenticated');
      } else {
        setAuthStatus('Failed to sign out. Please try again.');
        setIsAuthenticated(true);
        onAuthStatusChange('authenticated');
      }
    });
  };

  return (
    <div style={{
      fontFamily: "'Google Sans', Roboto, Arial, sans-serif",
      width: '280px',
      padding: '16px',
      margin: 0,
      color: '#333',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '16px',
        borderBottom: '1px solid #dadce0',
        paddingBottom: '12px',
      }}>
        <img
          src="icon48.png"
          width={24}
          height={24}
          style={{ marginRight: '12px' }}
          alt="Supercal logo"
        />
        <h1 style={{
          fontSize: '18px',
          margin: 0,
          fontWeight: 500,
        }}>Supercal</h1>
      </div>

      <div style={{
        marginBottom: '16px',
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: isAuthenticated ? '#e6f4ea' : '#f1f3f4',
        color: isAuthenticated ? '#137333' : '#333',
      }}>
        {authStatus}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
      }}>
        {!isAuthenticated ? (
          <button
            onClick={authenticate}
            style={{
              backgroundColor: '#1a73e8',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: "'Google Sans', Roboto, Arial, sans-serif",
              fontSize: '14px',
              marginRight: '8px',
            }}
          >
            Sign In
          </button>
        ) : (
          <button
            onClick={signOut}
            style={{
              backgroundColor: '#f1f3f4',
              color: '#1a73e8',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: "'Google Sans', Roboto, Arial, sans-serif",
              fontSize: '14px',
              marginRight: '8px',
            }}
          >
            Sign Out
          </button>
        )}
      </div>

      <div style={{
        fontSize: '12px',
        color: '#5f6368',
        marginTop: '16px',
        lineHeight: 1.4,
      }}>
        Once signed in, Supercal will automatically analyze your calendar data when you view Google Calendar.
      </div>
    </div>
  );
}; 