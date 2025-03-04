import React, { useEffect, useState } from 'react';

export const Options: React.FC = () => {
  const [extensionId, setExtensionId] = useState<string>('');

  useEffect(() => {
    // Get the extension ID to display to the user
    setExtensionId(chrome.runtime.id);
  }, []);

  return (
    <div style={{
      fontFamily: "'Google Sans', Roboto, Arial, sans-serif",
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
    }}>
      <h1 style={{
        fontSize: '24px',
        marginBottom: '20px',
        color: '#202124',
      }}>Supercal Options</h1>

      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
      }}>
        <h2 style={{
          fontSize: '18px',
          marginBottom: '10px',
          color: '#202124',
        }}>Extension Information</h2>
        <p style={{ margin: '0', color: '#5f6368' }}>
          Extension ID: <span className="extension-id">{extensionId}</span>
        </p>
      </div>

      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
      }}>
        <h2 style={{
          fontSize: '18px',
          marginBottom: '10px',
          color: '#202124',
        }}>About Supercal</h2>
        <p style={{ margin: '0 0 10px 0', color: '#5f6368' }}>
          Supercal is a Chrome extension that helps you track and analyze your time in Google Calendar.
          It provides a breakdown of your scheduled time by color category and helps you understand
          how your time is distributed across different types of events.
        </p>
      </div>
    </div>
  );
}; 