import { useState, useEffect } from 'react';

/**
 * Custom hook to detect URL changes
 */
export function useUrl() {
  const [url, setUrl] = useState(window.location.href);

  useEffect(() => {
    // Function to update the URL state
    const handleURLChange = () => {
      setUrl(window.location.href);
    };

    // Listen for popstate events (browser back/forward)
    window.addEventListener('popstate', handleURLChange);

    // Create a MutationObserver to detect changes to the URL via history.pushState
    const observer = new MutationObserver(() => {
      if (window.location.href !== url) {
        handleURLChange();
      }
    });

    // Observe the document title as a proxy for navigation changes
    const titleElement = document.querySelector('title');
    if (titleElement) {
      observer.observe(titleElement, {
        subtree: true,
        characterData: true,
        childList: true
      });
    } else {
      // If there's no title element, observe the document body instead
      observer.observe(document.body, {
        subtree: true,
        childList: true
      });
    }

    // Clean up
    return () => {
      window.removeEventListener('popstate', handleURLChange);
      observer.disconnect();
    };
  }, [url]);

  return url;
}
