import React, { useEffect } from 'react';
import useAdobeScript from './useAdobeScript';

interface PDFViewerProps {
  url: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url }) => {
  const { isLoaded, error } = useAdobeScript();
  const clientId = '5e2a9c163f214b07ad9d65fb43ba5cfc'; // Hardcoded Client ID

  useEffect(() => {
    if (isLoaded && !error && window.AdobeDC) {
      const adobeDCView = new window.AdobeDC.View({
        clientId,
        divId: 'adobe-dc-view',
      });

      adobeDCView.previewFile(
        {
          content: { location: { url } },
          metaData: { fileName: 'Document.pdf' },
        },
        {
          embedMode: 'FULL_WINDOW',
          showDownloadPDF: false,
          showPrintPDF: false,
          showAnnotationTools: false, // This will be ignored by TypeScript
        } as any // Type assertion
      );
    }
  }, [isLoaded, error, url, clientId]);

  return (
    <div className="relative w-full h-screen bg-gray-100 rounded-lg shadow-xl overflow-hidden">
      {!isLoaded && (
        <div className="flex justify-center items-center h-full w-full absolute bg-gray-100 bg-opacity-75 z-10">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading PDF document...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="flex justify-center items-center h-full w-full">
          <div className="text-red-500 text-center p-6 max-w-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium mt-2">Document Loading Error</h3>
            <p className="mt-1">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      {isLoaded && !error && (
        <div id="adobe-dc-view" style={{ height: '100vh', width: '100%' }} />
      )}
    </div>
  );
};

export default PDFViewer;