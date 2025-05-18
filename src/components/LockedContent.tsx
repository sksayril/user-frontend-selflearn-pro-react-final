import React from 'react';
import { Lock } from 'lucide-react';

interface LockedContentProps {
  contentType: 'text' | 'pdf' | 'image' | 'general';
  onSubscribe: () => void;
}

const LockedContent: React.FC<LockedContentProps> = ({ contentType, onSubscribe }) => {
  // Content-specific messages
  const messages = {
    text: {
      title: 'Premium Text Content',
      description: 'Subscribe to access this premium text content'
    },
    pdf: {
      title: 'Premium PDF Document',
      description: 'Subscribe to access and download PDF documents'
    },
    image: {
      title: 'Premium Images',
      description: 'Subscribe to view high-quality images'
    },
    general: {
      title: 'Premium Content',
      description: 'This premium content requires an active subscription to access'
    }
  };

  const { title, description } = messages[contentType];

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 rounded-lg border border-gray-200">
      <div className="bg-blue-100 p-4 rounded-full mb-3">
        <Lock className="w-8 h-8 text-blue-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 max-w-md mb-4">
        {description}
      </p>
      <button
        onClick={onSubscribe}
        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
      >
        Subscribe Now
      </button>
    </div>
  );
};

export default LockedContent; 