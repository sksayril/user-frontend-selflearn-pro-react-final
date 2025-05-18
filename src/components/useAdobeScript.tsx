import { useEffect, useState } from 'react';

// Define the shape of the AdobeDC global object
interface AdobeDC {
  View: new (config: { clientId: string; divId: string }) => {
    previewFile: (
      content: { content: { location: { url: string } }; metaData: { fileName: string } },
      options: { embedMode: string; showDownloadPDF: boolean; showPrintPDF: boolean }
    ) => void;
  };
}

// Extend the Window interface to include AdobeDC
declare global {
  interface Window {
    AdobeDC?: AdobeDC;
  }
}

// Define the return type for the hook
interface AdobeScriptState {
  isLoaded: boolean;
  error: string | null;
}

// Singleton to track script loading state
let isScriptLoading = false;
let scriptPromise: Promise<void> | null = null;

const useAdobeScript = (): AdobeScriptState => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if AdobeDC is already loaded
    if (window.AdobeDC) {
      setIsLoaded(true);
      return;
    }

    // If script is already loading, wait for it
    if (isScriptLoading && scriptPromise) {
      scriptPromise.then(() => {
        if (window.AdobeDC) {
          setIsLoaded(true);
        } else {
          setError('Failed to load Adobe PDF viewer.');
          setIsLoaded(true);
        }
      }).catch(() => {
        setError('Failed to load Adobe PDF viewer script.');
        setIsLoaded(true);
      });
      return;
    }

    // Load the script
    isScriptLoading = true;
    scriptPromise = new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector(
        'script[src="https://acrobatservices.adobe.com/view-sdk/viewer.js"]'
      ) as HTMLScriptElement | null;

      if (existingScript) {
        existingScript.onload = () => {
          window.AdobeDC ? resolve() : reject(new Error('Failed to load Adobe PDF viewer.'));
        };
        existingScript.onerror = () => reject(new Error('Failed to load Adobe PDF viewer script.'));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://acrobatservices.adobe.com/view-sdk/viewer.js';
      script.async = true;
      script.onload = () => {
        window.AdobeDC ? resolve() : reject(new Error('Failed to load Adobe PDF viewer.'));
      };
      script.onerror = () => reject(new Error('Failed to load Adobe PDF viewer script.'));
      document.body.appendChild(script);
    });

    scriptPromise.then(() => {
      setIsLoaded(true);
    }).catch((err) => {
      setError(err.message);
      setIsLoaded(true);
    });

    // No cleanup to remove script, as it may cause TypeError
  }, []);

  return { isLoaded, error };
};

export default useAdobeScript;